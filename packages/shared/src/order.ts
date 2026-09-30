import { z } from 'zod';
import { Category } from './category';
import { Id, IsoDateTime, Latitude, Longitude, MoneyMinor } from './common';
import { ImageUrl } from './image';

/** Stored status. `ready` and `missed` are derived for display only (see the roadmap). */
export const OrderStatus = z.enum(['reserved', 'collected', 'cancelled']);
export type OrderStatus = z.infer<typeof OrderStatus>;

/** What the apps show: stored status plus `ready` (inside the window) and `missed` (after it). */
export const DisplayStatus = z.enum(['reserved', 'ready', 'missed', 'collected', 'cancelled']);
export type DisplayStatus = z.infer<typeof DisplayStatus>;

export const PickupCode = z.string().regex(/^\d{4}$/, 'Code is 4 digits');

export const Order = z.object({
  id: Id,
  userId: Id,
  bagId: Id,
  storeId: Id,
  qty: z.number().int().positive(),
  /** Snapshots taken at reservation time. */
  unitPriceMinor: MoneyMinor,
  unitOriginalPriceMinor: MoneyMinor,
  code: PickupCode,
  status: OrderStatus,
  createdAt: IsoDateTime,
  collectedAt: IsoDateTime.nullable(),
  cancelledAt: IsoDateTime.nullable(),
});
export type Order = z.infer<typeof Order>;

/** Most bags one reservation can take. */
export const MAX_QTY_PER_ORDER = 5;

/** `POST /orders`. */
export const CreateOrderBody = z.object({
  bagId: Id,
  qty: z.number().int().min(1).max(MAX_QTY_PER_ORDER),
});
export type CreateOrderBody = z.infer<typeof CreateOrderBody>;

/**
 * Pure: the status to show at `now`. A reserved order is `ready` from the window's start
 * (inclusive) until its end (exclusive), and `missed` from the end on.
 */
export const deriveOrderStatus = (
  order: { status: OrderStatus; pickupStart: string; pickupEnd: string },
  now: Date,
): DisplayStatus => {
  if (order.status !== 'reserved') return order.status;
  const t = now.getTime();
  if (t >= new Date(order.pickupEnd).getTime()) return 'missed';
  if (t >= new Date(order.pickupStart).getTime()) return 'ready';
  return 'reserved';
};

const ORDER_NUMBER_DIGITS = 5;
const ORDER_NUMBER_SPACE = 10 ** ORDER_NUMBER_DIGITS;

/** Human order number for display, e.g. `LF-20418`, stable per order id. */
export const orderNumber = (id: string): string => {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % ORDER_NUMBER_SPACE;
  return `LF-${String(hash).padStart(ORDER_NUMBER_DIGITS, '0')}`;
};

/** An order as its customer sees it (Pickup, Orders, Review). */
export const OrderDetail = Order.omit({ userId: true }).extend({
  displayStatus: DisplayStatus,
  bag: z.object({
    id: Id,
    title: z.string().min(1),
    category: Category,
    pickupStart: IsoDateTime,
    pickupEnd: IsoDateTime,
    photoUrl: ImageUrl.nullable(),
  }),
  store: z.object({
    id: Id,
    name: z.string().min(1),
    address: z.string().min(1),
    lat: Latitude,
    lng: Longitude,
    timezone: z.string().min(1),
    logoUrl: ImageUrl.nullable(),
  }),
  /** The customer's overall rating once they've reviewed it (13). */
  rating: z.number().int().min(1).max(5).nullable(),
});
export type OrderDetail = z.infer<typeof OrderDetail>;

export const OrdersScope = z.enum(['current', 'past']);
export type OrdersScope = z.infer<typeof OrdersScope>;

/** `GET /orders/me?scope=`. */
export const MyOrdersQuery = z.object({ scope: OrdersScope });
export type MyOrdersQuery = z.infer<typeof MyOrdersQuery>;

export const MyOrdersResponse = z.object({
  orders: z.array(OrderDetail),
  /** Always the number of current orders, for the segment badge. */
  currentCount: z.number().int().nonnegative(),
});
export type MyOrdersResponse = z.infer<typeof MyOrdersResponse>;

/** Past orders older than this aren't listed. */
export const PAST_ORDERS_DAYS = 60;

// Shop side (12).

/** `POST /store/orders/confirm`. */
export const ConfirmCodeBody = z.object({ code: PickupCode });
export type ConfirmCodeBody = z.infer<typeof ConfirmCodeBody>;

/** An order in the shop's "Today's orders" list. */
export const StoreOrder = z.object({
  id: Id,
  code: PickupCode,
  /** First name (plus last initial once profiles carry one). */
  customerName: z.string().min(1),
  qty: z.number().int().positive(),
  bagTitle: z.string().min(1),
  pickupStart: IsoDateTime,
  pickupEnd: IsoDateTime,
  displayStatus: DisplayStatus,
  totalMinor: MoneyMinor,
  collectedAt: IsoDateTime.nullable(),
});
export type StoreOrder = z.infer<typeof StoreOrder>;

export const StoreOrdersToday = z.object({
  timezone: z.string().min(1),
  /** Reserved first (by window), then collected, then the rest. */
  orders: z.array(StoreOrder),
  counts: z.object({
    toCollect: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
});
export type StoreOrdersToday = z.infer<typeof StoreOrdersToday>;
