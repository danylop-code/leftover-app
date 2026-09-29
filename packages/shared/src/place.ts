import { z } from 'zod';
import { Latitude, Longitude } from './common';

export const PLACE_QUERY_MIN = 2;
export const PLACE_QUERY_MAX = 120;

/** A point with a human label: the selected search location, a recent, a suggestion. */
export const Place = z.object({
  label: z.string().min(1),
  /** Second line, e.g. `Lviv, Ukraine`. */
  secondary: z.string().min(1).optional(),
  lat: Latitude,
  lng: Longitude,
});
export type Place = z.infer<typeof Place>;

/** One address suggestion; it carries coordinates, so choosing it needs no second call. */
export const PlaceSuggestion = Place.extend({ id: z.string().min(1) });
export type PlaceSuggestion = z.infer<typeof PlaceSuggestion>;

/** `GET /geo/autocomplete` query: text plus an optional point to bias results towards. */
export const AutocompleteQuery = z
  .object({
    q: z.string().trim().min(PLACE_QUERY_MIN).max(PLACE_QUERY_MAX),
    lat: z.coerce.number().pipe(Latitude).optional(),
    lng: z.coerce.number().pipe(Longitude).optional(),
  })
  .refine((v) => (v.lat === undefined) === (v.lng === undefined), {
    path: ['lng'],
    message: 'Send lat and lng together',
  });
export type AutocompleteQuery = z.infer<typeof AutocompleteQuery>;

export const AutocompleteResponse = z.object({ results: z.array(PlaceSuggestion) });
export type AutocompleteResponse = z.infer<typeof AutocompleteResponse>;
