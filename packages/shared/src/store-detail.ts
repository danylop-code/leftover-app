import { z } from 'zod';
import { Bag } from './bag';
import { Latitude, Longitude } from './common';
import { AspectAverages, ReviewSummary } from './review';
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
  description: true,
  category: true,
  priceMinor: true,
  originalPriceMinor: true,
  qtyAvailable: true,
  pickupStart: true,
  pickupEnd: true,
  photoUrl: true,
});
export type StoreBag = z.infer<typeof StoreBag>;

/** Average (one decimal) and count; null while the store has no reviews. */
export const StoreRating = z.object({
  average: z.number().min(1).max(5),
  count: z.number().int().positive(),
});
export type StoreRating = z.infer<typeof StoreRating>;

/** StoreDetail's rating: adds per-aspect averages (aspects nobody rated are null). */
export const StoreRatingDetail = StoreRating.extend({ aspects: AspectAverages });
export type StoreRatingDetail = z.infer<typeof StoreRatingDetail>;

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
  rating: StoreRatingDetail.nullable(),
  /** Newest first, at most RECENT_REVIEWS_LIMIT. */
  recentReviews: z.array(ReviewSummary),
  /** Whether the signed-in customer saved this shop (14). */
  isFavorite: z.boolean(),
});
export type StoreDetail = z.infer<typeof StoreDetail>;
