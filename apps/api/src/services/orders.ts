import {
  type CreateOrderBody,
  deriveOrderStatus,
  type Order,
  type OrderDetail,
  type OrdersScope,
  PAST_ORDERS_DAYS,
} from '@leftover/shared';
import { and, eq, gte } from 'drizzle-orm';
import type { Db } from '../db/client';
import { bags, orders, stores } from '../db/schema';
import { now, nowIso } from '../lib/clock';
import { conflict, notFound } from '../lib/errors';
import { newId } from '../lib/ids';
import { imageUrl } from './image-keys';
import { CODE_WINDOW_HOURS, pickCode } from './pickup-code';
import { ratingsForOrders } from './reviews';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const soldOut = (qtyAvailable: number) =>
  conflict('sold_out', 'Just sold out — nothing was reserved.', { qtyAvailable });
const notAvailable = () =>
  conflict('not_available', 'This bag isn’t available any more — nothing was reserved.');
const orderNotFound = () => notFound('No such order.');

type OrderRow = typeof orders.$inferSelect;

export const toOrder = (o: OrderRow): Order => ({
  id: o.id,
  userId: o.userId,
  bagId: o.bagId,
  storeId: o.storeId,
  qty: o.qty,
  unitPriceMinor: o.unitPriceMinor,
  unitOriginalPriceMinor: o.unitOriginalPriceMinor,
  code: o.code,
  status: o.status,
  createdAt: o.createdAt,
  collectedAt: o.collectedAt,
  cancelledAt: o.cancelledAt,
});

/**
 * Reserves `qty` of a bag. Stock is taken with a guarded UPDATE and the order is inserted only
 * if that UPDATE changed a row (`changes() = 1`), in one batch: the last bag sells once, and a
 * failed reservation writes nothing (gotchas.md).
 */
export const createOrder = async (
  db: Db,
  userId: string,
  body: CreateOrderBody,
): Promise<Order> => {
  const bag = await db
    .select({
      storeId: bags.storeId,
      qtyAvailable: bags.qtyAvailable,
      isActive: bags.isActive,
      pickupEnd: bags.pickupEnd,
    })
    .from(bags)
    .where(eq(bags.id, body.bagId))
    .get();
  if (!bag) throw notFound('This bag doesn’t exist.');
  const at = nowIso();
  if (!bag.isActive || bag.pickupEnd <= at) throw notAvailable();
  if (bag.qtyAvailable < body.qty) throw soldOut(bag.qtyAvailable);

  const since = new Date(now().getTime() - CODE_WINDOW_HOURS * HOUR_MS).toISOString();
  const taken = await db
    .select({ code: orders.code })
    .from(orders)
    .where(
      and(
        eq(orders.storeId, bag.storeId),
        eq(orders.status, 'reserved'),
        gte(orders.createdAt, since),
      ),
    )
    .all();
  const code = pickCode(new Set(taken.map((t) => t.code)));
  const id = newId();

  const d1 = db.$client;
  const [taking] = await d1.batch([
    d1
      .prepare(
        `UPDATE bags SET qty_available = qty_available - ?1, updated_at = ?2
         WHERE id = ?3 AND qty_available >= ?1 AND is_active = 1 AND pickup_end > ?2`,
      )
      .bind(body.qty, at, body.bagId),
    d1
      .prepare(
        `INSERT INTO orders (id, user_id, bag_id, store_id, qty, unit_price_minor,
           unit_original_price_minor, code, status, created_at)
         SELECT ?1, ?2, id, store_id, ?3, price_minor, original_price_minor, ?4, 'reserved', ?5
         FROM bags WHERE id = ?6 AND changes() = 1`,
      )
      .bind(id, userId, body.qty, code, at, body.bagId),
  ]);

  if (taking?.meta.changes !== 1) {
    const current = await db
      .select({
        qtyAvailable: bags.qtyAvailable,
        isActive: bags.isActive,
        pickupEnd: bags.pickupEnd,
      })
      .from(bags)
      .where(eq(bags.id, body.bagId))
      .get();
    if (!current?.isActive || current.pickupEnd <= at) throw notAvailable();
    throw soldOut(current.qtyAvailable);
  }

  const row = await db.select().from(orders).where(eq(orders.id, id)).get();
  if (!row) throw new Error('Reserved order missing after insert');
  return toOrder(row);
};

const detailColumns = {
  order: orders,
  bag: {
    id: bags.id,
    title: bags.title,
    category: bags.category,
    pickupStart: bags.pickupStart,
    pickupEnd: bags.pickupEnd,
    photoKey: bags.photoKey,
  },
  store: {
    id: stores.id,
    name: stores.name,
    address: stores.address,
    lat: stores.lat,
    lng: stores.lng,
    timezone: stores.timezone,
    logoKey: stores.logoKey,
  },
};

type DetailRow = {
  order: OrderRow;
  bag: Omit<OrderDetail['bag'], 'photoUrl'> & { photoKey: string | null };
  store: Omit<OrderDetail['store'], 'logoUrl'> & { logoKey: string | null };
};

const toDetail = (row: DetailRow, rating: number | null, at: Date): OrderDetail => {
  const { userId: _userId, ...order } = toOrder(row.order);
  return {
    ...order,
    displayStatus: deriveOrderStatus(
      { status: row.order.status, pickupStart: row.bag.pickupStart, pickupEnd: row.bag.pickupEnd },
      at,
    ),
    bag: (({ photoKey, ...bag }) => ({ ...bag, photoUrl: imageUrl(photoKey) }))(row.bag),
    store: (({ logoKey, ...store }) => ({ ...store, logoUrl: imageUrl(logoKey) }))(row.store),
    rating,
  };
};

const selectDetails = (db: Db) =>
  db
    .select(detailColumns)
    .from(orders)
    .innerJoin(bags, eq(orders.bagId, bags.id))
    .innerJoin(stores, eq(orders.storeId, stores.id));

/** One of the customer's orders; someone else's is a 404, never a 403. */
export const getMyOrder = async (db: Db, userId: string, id: string): Promise<OrderDetail> => {
  const row = await selectDetails(db)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .get();
  if (!row) throw orderNotFound();
  const ratings = await ratingsForOrders(db, [id]);
  return toDetail(row, ratings.get(id) ?? null, now());
};

const isCurrent = (o: OrderDetail) => o.displayStatus === 'reserved' || o.displayStatus === 'ready';

/**
 * Current: reserved and not missed, soonest pickup first. Past: collected, cancelled or
 * missed from the last PAST_ORDERS_DAYS, newest pickup first.
 */
export const listMyOrders = async (db: Db, userId: string, scope: OrdersScope) => {
  const at = now();
  const since = new Date(at.getTime() - PAST_ORDERS_DAYS * DAY_MS).toISOString();
  const rows = await selectDetails(db)
    .where(and(eq(orders.userId, userId), gte(bags.pickupEnd, since)))
    .all();
  const ratings = await ratingsForOrders(
    db,
    rows.map((r) => r.order.id),
  );
  const all = rows.map((r) => toDetail(r, ratings.get(r.order.id) ?? null, at));
  const current = all
    .filter(isCurrent)
    .sort((a, b) => a.bag.pickupStart.localeCompare(b.bag.pickupStart));
  const past = all
    .filter((o) => !isCurrent(o))
    .sort((a, b) => b.bag.pickupStart.localeCompare(a.bag.pickupStart));
  return { orders: scope === 'current' ? current : past, currentCount: current.length };
};

/**
 * Cancels a reserved order before its window ends and puts the bags back, once: the restock
 * runs only if the status update changed a row (`changes() = 1`), in the same batch.
 */
export const cancelMyOrder = async (db: Db, userId: string, id: string): Promise<OrderDetail> => {
  const existing = await getMyOrder(db, userId, id);
  const at = nowIso();
  if (existing.status !== 'reserved' || existing.bag.pickupEnd <= at)
    throw conflict('not_cancellable', 'This reservation can’t be cancelled any more.');

  const d1 = db.$client;
  const [cancelling] = await d1.batch([
    d1
      .prepare(
        `UPDATE orders SET status = 'cancelled', cancelled_at = ?1
         WHERE id = ?2 AND user_id = ?3 AND status = 'reserved'`,
      )
      .bind(at, id, userId),
    d1
      .prepare(
        `UPDATE bags SET qty_available = qty_available + ?1, updated_at = ?2
         WHERE id = ?3 AND changes() = 1`,
      )
      .bind(existing.qty, at, existing.bagId),
  ]);
  if (cancelling?.meta.changes !== 1)
    throw conflict('not_cancellable', 'This reservation can’t be cancelled any more.');
  return getMyOrder(db, userId, id);
};
