import {
  AutocompleteResponse,
  type LatLng,
  PLACE_QUERY_MIN,
  type PlaceSuggestion,
} from '@leftover/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SUGGEST_DEBOUNCE_MS, SUGGEST_TIMEOUT_MS } from '../constants/location';
import { searchOnDevice } from '../lib/device-geo';
import { useDebouncedValue } from '../lib/use-debounced-value';
import { ApiError, apiRequest, NetworkError, ParseError } from './client';
import { keys } from './keys';

type Near = LatLng | null;

const fromApi = async (q: string, near: Near, signal: AbortSignal) => {
  const { results } = await apiRequest('/geo/autocomplete', {
    schema: AutocompleteResponse,
    query: { q, lat: near?.lat, lng: near?.lng },
    signal,
  });
  return results;
};

/** The provider can't help right now (down, slow, offline): search on the device instead. */
const providerUnavailable = (error: unknown) =>
  error instanceof NetworkError ||
  error instanceof ParseError ||
  (error instanceof ApiError && error.status >= 500);

/**
 * Suggestions from the API's provider (the key stays server-side), falling back to on-device
 * geocoding when it fails or takes longer than SUGGEST_TIMEOUT_MS.
 */
export const fetchAddressSuggestions = async (
  q: string,
  near: Near,
  signal: AbortSignal,
): Promise<PlaceSuggestion[]> => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, SUGGEST_TIMEOUT_MS);
  try {
    return await fromApi(q, near, controller.signal);
  } catch (error) {
    if (signal.aborted) throw error;
    if (timedOut || providerUnavailable(error)) return searchOnDevice(q, near);
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
};

/**
 * Debounced address suggestions for `text`, biased to (and sorted from) `near`.
 * `searching` is true while a search for the current text is still pending.
 */
export const useAddressSuggestions = (text: string, near: Near) => {
  const trimmed = text.trim();
  const q = useDebouncedValue(trimmed, SUGGEST_DEBOUNCE_MS);
  const enabled = q.length >= PLACE_QUERY_MIN;
  const query = useQuery({
    queryKey: keys.addressSuggestions({ q, near }),
    queryFn: ({ signal }) => fetchAddressSuggestions(q, near, signal),
    enabled,
    retry: false,
    placeholderData: keepPreviousData,
  });
  const active = trimmed.length >= PLACE_QUERY_MIN;
  return {
    results: active && enabled ? (query.data ?? []) : [],
    searching: active && (q !== trimmed || query.isFetching),
    /** A search for the current text finished and found nothing. */
    empty:
      active &&
      enabled &&
      q === trimmed &&
      query.isSuccess &&
      !query.isPlaceholderData &&
      query.data.length === 0,
  };
};
