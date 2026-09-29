import { z } from 'zod';
import { Category } from './category';
import { Id, IsoDateTime, MoneyMinor } from './common';
import { ImageUrl } from './image';

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
  /** Uploaded on the bag form (20); null shows the category tint. */
  photoUrl: ImageUrl.nullable(),
});
export type Bag = z.infer<typeof Bag>;
