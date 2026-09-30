import { z } from 'zod';
import { Bag } from './bag';
import { Category } from './category';
import { Latitude, Longitude } from './common';
import { Store } from './store';
import { StoreRating } from './store-detail';

// The Location screen's radius slider uses the same range.
export const NEARBY_RADIUS_MIN_KM = 1;
export const NEARBY_RADIUS_MAX_KM = 30;

/** `GET /bags/nearby` query: the selected location, radius and optional category. */
export const NearbyQuery = z.object({
  lat: z.coerce.number().pipe(Latitude),
  lng: z.coerce.number().pipe(Longitude),
  radiusKm: z.coerce.number().min(NEARBY_RADIUS_MIN_KM).max(NEARBY_RADIUS_MAX_KM),
  category: Category.optional(),
});
export type NearbyQuery = z.infer<typeof NearbyQuery>;

/** A bag on Discover: what the card shows, with its store and distance from the query point. */
export const NearbyBag = Bag.pick({
  id: true,
  title: true,
  category: true,
  priceMinor: true,
  originalPriceMinor: true,
  qtyAvailable: true,
  pickupStart: true,
  pickupEnd: true,
  photoUrl: true,
}).extend({
  store: Store.pick({ id: true, name: true, timezone: true, logoUrl: true }),
  distanceKm: z.number().nonnegative(),
  /** The shop's rating; null while it has no reviews (13). */
  rating: StoreRating.nullable(),
  /** Whether the signed-in customer saved this bag's shop (14). */
  isFavorite: z.boolean(),
});
export type NearbyBag = z.infer<typeof NearbyBag>;

/** Nearest first; ties by earliest pickup. */
export const NearbyResponse = z.object({ bags: z.array(NearbyBag) });
export type NearbyResponse = z.infer<typeof NearbyResponse>;
