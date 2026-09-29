import { z } from 'zod';
import { Category } from './category';
import { Id, IsoDateTime, MoneyMinor } from './common';

export const Bag = z.object({
  id: Id,
  storeId: Id,
  title: z.string().min(1),
  description: z.string(),
  category: Category,
  priceMinor: MoneyMinor,
  originalPriceMinor: MoneyMinor,
  qtyTotal: z.number().int().nonnegative(),
  qtyAvailable: z.number().int().nonnegative(),
  pickupStart: IsoDateTime,
  pickupEnd: IsoDateTime,
  isActive: z.boolean(),
});
export type Bag = z.infer<typeof Bag>;
