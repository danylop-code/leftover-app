import {
  type Bag,
  type BagBody,
  BagBody as BagBodySchema,
  type BagPatch,
  type ShopBag,
  type ShopBagsResponse,
} from '@leftover/shared';
import { and, eq, gte, inArray, ne } from 'drizzle-orm';
import type { Db } from '../db/client';
import { bags, orders, stores } from '../db/schema';
import { now, nowIso } from '../lib/clock';
import { AppError, conflict, fieldsFromZod, notFound, ValidationError } from '../lib/errors';
import { newId } from '../lib/ids';
import { imageUrl } from './image-keys';
import { localDate } from './opening-hours';

const DAY_MS = 24 * 60 * 60 * 1000;
// Bags are listed from their pickup day; older ones drop off the list.
const LIST_LOOKBACK_DAYS = 2;

type BagRow = typeof bags.$inferSelect;
type StoreRow = typeof stores.$inferSelect;

export const toBag = (b: BagRow): Bag => ({
  id: b.id,
  storeId: b.storeId,
  title: b.title,
  description: b.description,
  category: b.category,
  priceMinor: b.priceMinor,
  originalPriceMinor: b.originalPriceMinor,
  qtyTotal: b.qtyTotal,
  qtyAvailable: b.qtyAvailable,
  pickupStart: b.pickupStart,
  pickupEnd: b.pickupEnd,
  isActive: b.isActive,
  photoUrl: imageUrl(b.photoKey),
});

/** Reserved or collected bags: total minus what's still available. */
const reservedOf = (b: Pick<Bag, 'qtyTotal' | 'qtyAvailable'>) => b.qtyTotal - b.qtyAvailable;
const toShopBag = (b: BagRow): ShopBag => ({ ...toBag(b), reservedCount: reservedOf(b) });

export const requireMyStore = async (db: Db, ownerId: string): Promise<StoreRow> => {
  const store = await db.select().from(stores).where(eq(stores.ownerId, ownerId)).get();
  if (!store) throw notFound('You haven’t set up your shop yet.');
  return store;
};

export const findMyBag = async (db: Db, storeId: string, id: string) => {
  const bag = await db
    .select()
    .from(bags)
    .where(and(eq(bags.id, id), eq(bags.storeId, storeId)))
    .get();
  if (!bag) throw notFound('No such bag.');
  return bag;
};

/** The window must be today in the shop's timezone and still to come. */
const checkWindow = (store: StoreRow, pickupStart: string, pickupEnd: string) => {
  const at = now();
  const fields: Record<string, string[]> = {};
  if (localDate(pickupStart, store.timezone) !== localDate(at, store.timezone))
    fields.pickupStart = ['The pickup window must be today'];
  if (new Date(pickupEnd).getTime() <= at.getTime())
    fields.pickupEnd = ['The pickup window must end in the future'];
  if (Object.keys(fields).length > 0) throw new ValidationError(fields);
};

/** Today's bags for the shop (and later ones), with the header stats. */
export const listMyBags = async (db: Db, ownerId: string): Promise<ShopBagsResponse> => {
  const store = await requireMyStore(db, ownerId);
  const at = now();
  const today = localDate(at, store.timezone);
  const since = new Date(at.getTime() - LIST_LOOKBACK_DAYS * DAY_MS).toISOString();
  const rows = await db
    .select()
    .from(bags)
    .where(and(eq(bags.storeId, store.id), gte(bags.pickupEnd, since)))
    .all();
  const listed = rows
    .filter((b) => localDate(b.pickupStart, store.timezone) >= today || b.pickupEnd > nowIso())
    .sort((a, b) => a.pickupStart.localeCompare(b.pickupStart));

  const todayIds = rows
    .filter((b) => localDate(b.pickupStart, store.timezone) === today)
    .map((b) => b.id);
  const reserved =
    todayIds.length === 0
      ? []
      : await db
          .select({ qty: orders.qty })
          .from(orders)
          .where(and(inArray(orders.bagId, todayIds), ne(orders.status, 'cancelled')))
          .all();

  const isoNow = at.toISOString();
  return {
    storeName: store.name,
    timezone: store.timezone,
    bags: listed.map(toShopBag),
    stats: {
      liveNow: listed.filter((b) => b.isActive && b.qtyAvailable > 0 && b.pickupEnd > isoNow)
        .length,
      reservedToday: reserved.reduce((sum, o) => sum + o.qty, 0),
    },
  };
};

export const createMyBag = async (db: Db, ownerId: string, input: BagBody): Promise<ShopBag> => {
  const store = await requireMyStore(db, ownerId);
  const body = BagBodySchema.parse(input);
  checkWindow(store, body.pickupStart, body.pickupEnd);
  const at = nowIso();
  const row: BagRow = {
    id: newId(),
    storeId: store.id,
    ...body,
    qtyAvailable: body.qtyTotal,
    photoKey: null,
    createdAt: at,
    updatedAt: at,
  };
  await db.insert(bags).values(row);
  return toShopBag(row);
};

/**
 * Edits a bag. The merged bag is re-validated; a new total adjusts availability by the
 * difference and may not go below what's already reserved (409 `below_reserved`), guarded in
 * the UPDATE itself so a reservation landing meanwhile can't be oversold.
 */
export const updateMyBag = async (
  db: Db,
  ownerId: string,
  id: string,
  patch: BagPatch,
): Promise<ShopBag> => {
  const store = await requireMyStore(db, ownerId);
  const existing = await findMyBag(db, store.id, id);
  const merged = BagBodySchema.safeParse({ ...toBag(existing), ...patch });
  if (!merged.success) throw new ValidationError(fieldsFromZod(merged.error));
  const next = merged.data;
  if (patch.pickupStart !== undefined || patch.pickupEnd !== undefined)
    checkWindow(store, next.pickupStart, next.pickupEnd);

  const d1 = db.$client;
  const result = await d1
    .prepare(
      `UPDATE bags SET title = ?1, description = ?2, category = ?3, price_minor = ?4,
         original_price_minor = ?5, qty_available = qty_available + (?6 - qty_total),
         qty_total = ?6, pickup_start = ?7, pickup_end = ?8, is_active = ?9, updated_at = ?10
       WHERE id = ?11 AND store_id = ?12 AND ?6 >= qty_total - qty_available`,
    )
    .bind(
      next.title,
      next.description,
      next.category,
      next.priceMinor,
      next.originalPriceMinor,
      next.qtyTotal,
      next.pickupStart,
      next.pickupEnd,
      next.isActive ? 1 : 0,
      nowIso(),
      id,
      store.id,
    )
    .run();
  if (result.meta.changes !== 1) {
    const current = await findMyBag(db, store.id, id);
    throw conflict('below_reserved', 'You can’t offer fewer bags than are already reserved.', {
      reservedCount: reservedOf(current),
    });
  }
  return toShopBag(await findMyBag(db, store.id, id));
};

/**
 * Deletes a bag nobody has ordered. With reserved orders: 409 `has_reservations` (pause it
 * instead); with only past orders it can't be removed either (their history points at it).
 */
export const deleteMyBag = async (
  db: Db,
  ownerId: string,
  id: string,
  images: R2Bucket,
): Promise<void> => {
  const store = await requireMyStore(db, ownerId);
  const bag = await findMyBag(db, store.id, id);
  const linked = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.bagId, id))
    .all();
  if (linked.some((o) => o.status === 'reserved'))
    throw conflict('has_reservations', 'This bag has reservations. Pause it instead.');
  if (linked.length > 0)
    throw new AppError(409, 'has_orders', 'This bag has past orders. Pause it instead.');
  await db.delete(bags).where(and(eq(bags.id, id), eq(bags.storeId, store.id)));
  if (bag.photoKey) await images.delete(bag.photoKey);
};
