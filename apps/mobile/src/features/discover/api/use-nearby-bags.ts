import { type Category, NearbyResponse } from '@leftover/shared';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';
import type { SearchArea } from '../../../shared/store/location';

export type NearbyParams = SearchArea & { category: Category | null };

const fetchNearby = ({ category, ...area }: NearbyParams, signal: AbortSignal) =>
  apiRequest('/bags/nearby', {
    schema: NearbyResponse,
    query: { ...area, ...(category ? { category } : {}) },
    signal,
  });

/**
 * Bags near the selected area. The key holds every input, and there is deliberately no
 * placeholder data: a new location shows loading, never distances from the old one (gotchas.md).
 */
export const useNearbyBags = (params: NearbyParams, enabled = true) =>
  useQuery({
    queryKey: keys.nearby(params),
    queryFn: ({ signal }) => fetchNearby(params, signal),
    select: (data) => data.bags,
    enabled,
  });
