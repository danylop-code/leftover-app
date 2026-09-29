import { z } from 'zod';
import { Latitude, Longitude } from './common';
import { Store } from './store';
import { StoreRating } from './store-detail';

/** `GET /favorites`: the customer's selected location, for distances. */
export const FavoritesQuery = z.object({
  lat: z.coerce.number().pipe(Latitude),
  lng: z.coerce.number().pipe(Longitude),
});
export type FavoritesQuery = z.infer<typeof FavoritesQuery>;

/** A saved shop on the Saved tab. */
export const SavedShop = z.object({
  store: Store.pick({ id: true, name: true, category: true, address: true }),
  distanceKm: z.number().nonnegative(),
  rating: StoreRating.nullable(),
  /** Bags that can still be reserved (active, in stock, window not over). */
  bagsAvailable: z.number().int().nonnegative(),
});
export type SavedShop = z.infer<typeof SavedShop>;

/** Nearest first. */
export const SavedShopsResponse = z.object({ shops: z.array(SavedShop) });
export type SavedShopsResponse = z.infer<typeof SavedShopsResponse>;
