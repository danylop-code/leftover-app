import type { AutocompleteQuery, LatLng, PlaceSuggestion } from '@leftover/shared';
import { z } from 'zod';

// Photon (https://github.com/komoot/photon): OpenStreetMap search-as-you-type, no key.
// This file is the only one that knows the provider; swap it to change providers.

/** Features asked for; the service dedupes and trims to its own limit. */
const PHOTON_LIMIT = 10;
// The public instance is usually ~1 s but has slow moments; the app waits a bit longer
// (SUGGEST_TIMEOUT_MS) before it falls back to on-device search.
const PHOTON_TIMEOUT_MS = 6000;
// The public instance asks clients to identify themselves.
const USER_AGENT = 'Leftover/0.1 (+https://github.com/danylop-code/leftover-app)';

const Feature = z.object({
  geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
  properties: z.object({
    osm_type: z.string(),
    osm_id: z.number(),
    name: z.string().optional(),
    street: z.string().optional(),
    housenumber: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    county: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }),
});
const Response = z.object({ features: z.array(Feature) });
type Properties = z.infer<typeof Feature>['properties'];

const join = (parts: (string | undefined)[], label: string) =>
  [...new Set(parts.filter((p): p is string => Boolean(p) && p !== label))].join(', ') || undefined;

/**
 * A named place (shop, stop, square) leads with its name and puts the street underneath;
 * a plain address leads with street + number.
 */
export const toSuggestion = (feature: z.infer<typeof Feature>): PlaceSuggestion | null => {
  const p: Properties = feature.properties;
  const [lng, lat] = feature.geometry.coordinates;
  const streetLine = p.street ? [p.street, p.housenumber].filter(Boolean).join(' ') : undefined;
  const label = p.name ?? streetLine;
  if (!label) return null;
  const locality = p.city ?? p.district ?? p.county ?? p.state;
  const secondary = join([p.name ? streetLine : undefined, locality, p.country], label);
  return {
    id: `${p.osm_type}${p.osm_id}`,
    label,
    ...(secondary ? { secondary } : {}),
    lat,
    lng,
  };
};

export class ProviderError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ProviderError';
  }
}

const fetchFeatures = async (url: URL) => {
  let res: globalThis.Response;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(PHOTON_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new ProviderError('Photon unreachable', cause);
  }
  if (!res.ok) throw new ProviderError(`Photon answered ${res.status}`);

  let body: unknown;
  try {
    body = await res.json();
  } catch (cause) {
    throw new ProviderError('Photon answered non-JSON', cause);
  }
  const parsed = Response.safeParse(body);
  if (!parsed.success) throw new ProviderError('Photon answered an unexpected shape');
  return parsed.data.features.map(toSuggestion).filter((s) => s !== null);
};

/** Raw suggestions from Photon, biased towards the query's point. Throws ProviderError. */
export const photonAutocomplete = async (
  baseUrl: string,
  query: AutocompleteQuery,
): Promise<PlaceSuggestion[]> => {
  const url = new URL('/api/', baseUrl);
  url.searchParams.set('q', query.q);
  url.searchParams.set('limit', String(PHOTON_LIMIT));
  url.searchParams.set('lang', 'en');
  if (query.lat !== undefined && query.lng !== undefined) {
    url.searchParams.set('lat', String(query.lat));
    url.searchParams.set('lon', String(query.lng));
  }
  return fetchFeatures(url);
};

/** The nearest named place or address to a point, or null. Throws ProviderError. */
export const photonReverse = async (
  baseUrl: string,
  point: LatLng,
): Promise<PlaceSuggestion | null> => {
  const url = new URL('/reverse', baseUrl);
  url.searchParams.set('lat', String(point.lat));
  url.searchParams.set('lon', String(point.lng));
  url.searchParams.set('lang', 'en');
  url.searchParams.set('limit', '1');
  const [nearest] = await fetchFeatures(url);
  return nearest ?? null;
};
