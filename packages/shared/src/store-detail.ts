import { z } from 'zod';
import { Bag } from './bag';
import { Latitude, Longitude } from './common';
import { Store } from './store';

/** `GET /stores/:id` query: the customer's selected location, for the distance. */
export const StoreDetailQuery = z.object({
  lat: z.coerce.number().pipe(Latitude),
  lng: z.coerce.number().pipe(Longitude),
});
export type StoreDetailQuery = z.infer<typeof StoreDetailQuery>;

/** Now, in the store's timezone, against its opening hours. */
export const OpenStatus = z.enum(['open', 'beforeOpening', 'afterClosing']);
export type OpenStatus = z.infer<typeof OpenStatus>;

export const StoreBag = Bag.pick({
  id: true,
  title: true,
  category: true,
  priceMinor: true,
  originalPriceMinor: true,
  qtyAvailable: true,
  pickupStart: true,
  pickupEnd: true,
});
export type StoreBag = z.infer<typeof StoreBag>;

/** Average and count; null until the store has reviews (brief 13 fills it). */
export const StoreRating = z.object({
  average: z.number().min(1).max(5),
  count: z.number().int().positive(),
});
export type StoreRating = z.infer<typeof StoreRating>;

export const StoreDetail = z.object({
  store: Store,
  distanceKm: z.number().nonnegative(),
  openStatus: OpenStatus,
  /** Today's bags whose window hasn't ended: available first, then sold out; each by pickup start. */
  bags: z.array(StoreBag),
  counts: z.object({
    available: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  rating: StoreRating.nullable(),
});
export type StoreDetail = z.infer<typeof StoreDetail>;
