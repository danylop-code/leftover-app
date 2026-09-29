import {
  type ConfirmCodeBody,
  deriveOrderStatus,
  type StoreOrder,
  type StoreOrdersToday,
} from '@leftover/shared';
import { and, eq, gte } from 'drizzle-orm';
import type { Db } from '../db/client';
import { bags, orders, users } from '../db/schema';
import { now, nowIso } from '../lib/clock';
import { AppError } from '../lib/errors';
import { localDate } from './opening-hours';
import { requireMyStore } from './store-bags';

const DAY_MS = 24 * 60 * 60 * 1000;

const codeNotFound = (code: string) =>
  new AppError(404, 'code_not_found', `No order today matches ${code}.`);

const rank: Record<StoreOrder['displayStatus'], number> = {
  ready: 0,
  reserved: 0,
  collected: 1,
  missed: 2,
  cancelled: 3,
};

/** The shop's orders whose bag window is today in its timezone (cancelled ones left out). */
const todaysOrders = async (db: Db, storeId: string, timeZone: string) => {
  const at = now();
  const today = localDate(at, timeZone);
  const rows = await db
    .select({
      id: orders.id,
      code: orders.code,
      status: orders.status,
      qty: orders.qty,
      unitPriceMinor: orders.unitPriceMinor,
      collectedAt: orders.collectedAt,
      customerName: users.firstName,
      bagTitle: bags.title,
      pickupStart: bags.pickupStart,
      pickupEnd: bags.pickupEnd,
    })
    .from(orders)
    .innerJoin(bags, eq(orders.bagId, bags.id))
    .innerJoin(users, eq(orders.userId, users.id))
    .where(
      and(
        eq(orders.storeId, storeId),
        gte(bags.pickupEnd, new Date(at.getTime() - DAY_MS).toISOString()),
      ),
    )
    .all();
  return rows
    .filter((r) => r.status !== 'cancelled' && localDate(r.pickupStart, timeZone) === today)
    .map(
      (r): StoreOrder => ({
        id: r.id,
        code: r.code,
        customerName: r.customerName,
        qty: r.qty,
        bagTitle: r.bagTitle,
        pickupStart: r.pickupStart,
        pickupEnd: r.pickupEnd,
        displayStatus: deriveOrderStatus(r, at),
        totalMinor: r.unitPriceMinor * r.qty,
        collectedAt: r.collectedAt,
      }),
    );
};

/** "Today's orders": still to collect first (by window), then collected (latest first). */
export const listTodaysOrders = async (db: Db, ownerId: string): Promise<StoreOrdersToday> => {
  const store = await requireMyStore(db, ownerId);
  const list = await todaysOrders(db, store.id, store.timezone);
  list.sort(
    (a, b) =>
      rank[a.displayStatus] - rank[b.displayStatus] ||
      (a.displayStatus === 'collected'
        ? (b.collectedAt ?? '').localeCompare(a.collectedAt ?? '')
        : a.pickupStart.localeCompare(b.pickupStart)),
  );
  const toCollect = list.filter((o) => rank[o.displayStatus] === 0).length;
  return { timezone: store.timezone, orders: list, counts: { toCollect, total: list.length } };
};

/**
 * Marks today's reserved order with this code as collected. The UPDATE is guarded on
 * `status = 'reserved'`, so a second confirm finds nothing (404 `code_not_found`).
 */
export const confirmCode = async (
  db: Db,
  ownerId: string,
  { code }: ConfirmCodeBody,
): Promise<StoreOrder> => {
  const store = await requireMyStore(db, ownerId);
  const at = nowIso();
  const match = (await todaysOrders(db, store.id, store.timezone)).find(
    (o) => o.code === code && o.displayStatus !== 'collected' && o.displayStatus !== 'missed',
  );
  if (!match) throw codeNotFound(code);
  const result = await db
    .update(orders)
    .set({ status: 'collected', collectedAt: at })
    .where(and(eq(orders.id, match.id), eq(orders.status, 'reserved')))
    .run();
  if (result.meta.changes !== 1) throw codeNotFound(code);
  return { ...match, displayStatus: 'collected', collectedAt: at };
};
