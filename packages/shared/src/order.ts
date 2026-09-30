import { z } from 'zod';
import { Id, IsoDateTime, MoneyMinor } from './common';

/** Stored status. `ready` and `missed` are derived for display only (see the roadmap). */
export const OrderStatus = z.enum(['reserved', 'collected', 'cancelled']);
export type OrderStatus = z.infer<typeof OrderStatus>;

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
