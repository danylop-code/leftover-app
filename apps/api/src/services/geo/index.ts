import { type AutocompleteQuery, haversineKm, type PlaceSuggestion } from '@leftover/shared';
import { AppError } from '../../lib/errors';
import { ProviderError, photonAutocomplete } from './photon';

/** Suggestions returned to the app. */
export const SUGGESTION_LIMIT = 6;

export const geoUnavailable = () =>
  new AppError(502, 'geo_unavailable', 'Address search is unavailable right now.');

// Photon can list one OSM object twice (as a street and as a house), so ids repeat too.
const sameAddress = (a: PlaceSuggestion, b: PlaceSuggestion) =>
  a.id === b.id || (a.label === b.label && a.secondary === b.secondary);

/**
 * Address suggestions for `query`: repeated addresses dropped, nearest to the bias point first.
 * 502 `geo_unavailable` when the provider fails, so the app can fall back to on-device lookup.
 */
export const autocompletePlaces = async (
  env: Pick<Env, 'PHOTON_URL'>,
  query: AutocompleteQuery,
): Promise<PlaceSuggestion[]> => {
  let raw: PlaceSuggestion[];
  try {
    raw = await photonAutocomplete(env.PHOTON_URL, query);
  } catch (error) {
    if (error instanceof ProviderError) {
      console.warn(error.message, error.cause);
      throw geoUnavailable();
    }
    throw error;
  }

  const unique = raw.filter((s, i) => raw.findIndex((t) => sameAddress(s, t)) === i);
  const { lat, lng } = query;
  if (lat !== undefined && lng !== undefined) {
    const from = { lat, lng };
    unique.sort((a, b) => haversineKm(from, a) - haversineKm(from, b));
  }
  return unique.slice(0, SUGGESTION_LIMIT);
};
