import { z } from 'zod';
import { Bag } from './bag';
import { Category } from './category';
import { Latitude, Longitude } from './common';
import { Store } from './store';

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
}).extend({
  store: Store.pick({ id: true, name: true, timezone: true }),
  distanceKm: z.number().nonnegative(),
});
export type NearbyBag = z.infer<typeof NearbyBag>;

/** Nearest first; ties by earliest pickup. */
export const NearbyResponse = z.object({ bags: z.array(NearbyBag) });
export type NearbyResponse = z.infer<typeof NearbyResponse>;
