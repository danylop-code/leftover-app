import { type LatLng, SavedShopsResponse } from '@leftover/shared';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

/** The customer's saved shops, with distances from the selected location. */
export const useSavedShops = (from: LatLng) =>
  useQuery({
    queryKey: keys.saved({ lat: from.lat, lng: from.lng }),
    queryFn: ({ signal }) =>
      apiRequest('/favorites', {
        schema: SavedShopsResponse,
        query: { lat: from.lat, lng: from.lng },
        signal,
      }),
    select: (data) => data.shops,
  });
