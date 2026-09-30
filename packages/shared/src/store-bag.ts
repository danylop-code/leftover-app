import { z } from 'zod';
import { Bag } from './bag';
import { Category } from './category';
import { IsoDateTime, MoneyMinor } from './common';

export const BAG_TITLE_MIN = 3;
export const BAG_TITLE_MAX = 60;
export const BAG_DESCRIPTION_MAX = 200;
export const BAG_QTY_MIN = 1;
export const BAG_QTY_MAX = 50;
export const MIN_PICKUP_WINDOW_MINUTES = 30;
const MS_PER_MINUTE = 60_000;

const fields = z.object({
  title: z.string().trim().min(BAG_TITLE_MIN).max(BAG_TITLE_MAX),
  description: z.string().trim().max(BAG_DESCRIPTION_MAX).default(''),
  category: Category,
  originalPriceMinor: MoneyMinor,
  priceMinor: MoneyMinor.positive(),
  qtyTotal: z.number().int().min(BAG_QTY_MIN).max(BAG_QTY_MAX),
  pickupStart: IsoDateTime,
  pickupEnd: IsoDateTime,
  isActive: z.boolean().default(true),
});

type Checkable = Partial<
  Pick<z.infer<typeof fields>, 'priceMinor' | 'originalPriceMinor' | 'pickupStart' | 'pickupEnd'>
>;

const saleBelowOriginal = {
  check: (b: Checkable) =>
    b.priceMinor === undefined ||
    b.originalPriceMinor === undefined ||
    b.priceMinor < b.originalPriceMinor,
  params: { path: ['priceMinor'], message: 'Sale price must be below the original price' },
};

const windowLongEnough = {
  check: (b: Checkable) =>
    !b.pickupStart ||
    !b.pickupEnd ||
    new Date(b.pickupEnd).getTime() - new Date(b.pickupStart).getTime() >=
      MIN_PICKUP_WINDOW_MINUTES * MS_PER_MINUTE,
  params: { path: ['pickupEnd'], message: 'The pickup window must be at least 30 minutes' },
};

/**
 * `POST /store/bags`. The API also checks what needs the store and the clock: the window is
 * today in the store's timezone and ends in the future.
 */
export const BagBody = fields
  .refine(saleBelowOriginal.check, saleBelowOriginal.params)
  .refine(windowLongEnough.check, windowLongEnough.params);
export type BagBody = z.input<typeof BagBody>;

/** `PATCH /store/bags/:id`: any subset; the merged bag is re-validated as a whole. */
export const BagPatch = fields
  .partial()
  .refine(saleBelowOriginal.check, saleBelowOriginal.params)
  .refine(windowLongEnough.check, windowLongEnough.params);
export type BagPatch = z.infer<typeof BagPatch>;

/** A bag on the shop's "My bags" list, with how many are already reserved. */
export const ShopBag = Bag.extend({ reservedCount: z.number().int().nonnegative() });
export type ShopBag = z.infer<typeof ShopBag>;

export const ShopBagsResponse = z.object({
  storeName: z.string().min(1),
  timezone: z.string().min(1),
  bags: z.array(ShopBag),
  stats: z.object({
    /** Active, in stock, window not over. */
    liveNow: z.number().int().nonnegative(),
    /** Bags in today's non-cancelled orders. */
    reservedToday: z.number().int().nonnegative(),
  }),
});
export type ShopBagsResponse = z.infer<typeof ShopBagsResponse>;
