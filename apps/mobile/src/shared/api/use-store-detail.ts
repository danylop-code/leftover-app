import { type LatLng, StoreDetail } from '@leftover/shared';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client';
import { keys } from './keys';

/**
 * A shop with today's bags; `from` is the customer's selected location, so the distance is
 * never from an old one.
 */
export const useStoreDetail = (id: string, from: LatLng) =>
  useQuery({
    queryKey: keys.storeDetail({ id, lat: from.lat, lng: from.lng }),
    queryFn: ({ signal }) =>
      apiRequest(`/stores/${encodeURIComponent(id)}`, {
        schema: StoreDetail,
        query: { lat: from.lat, lng: from.lng },
        signal,
      }),
  });
