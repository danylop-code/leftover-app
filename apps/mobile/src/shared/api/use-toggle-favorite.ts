import type { NearbyResponse, StoreDetail } from '@leftover/shared';
import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, NoContent } from './client';
import { keys } from './keys';

type Vars = { storeId: string; save: boolean };

/**
 * Saves or unsaves a shop. The heart flips at once in every cached Discover list and shop
 * page; on failure the caches roll back (the caller shows the toast).
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, save }: Vars) =>
      apiRequest(`/favorites/${encodeURIComponent(storeId)}`, {
        method: save ? 'PUT' : 'DELETE',
        schema: NoContent,
      }),
    onMutate: async ({ storeId, save }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: keys.nearbyAll() }),
        queryClient.cancelQueries({ queryKey: keys.storeDetailAll() }),
      ]);
      const snapshot: [QueryKey, unknown][] = [
        ...queryClient.getQueriesData({ queryKey: keys.nearbyAll() }),
        ...queryClient.getQueriesData({ queryKey: keys.storeDetailAll() }),
      ];
      queryClient.setQueriesData<NearbyResponse>({ queryKey: keys.nearbyAll() }, (old) =>
        old
          ? {
              ...old,
              bags: old.bags.map((b) => (b.store.id === storeId ? { ...b, isFavorite: save } : b)),
            }
          : old,
      );
      queryClient.setQueriesData<StoreDetail>({ queryKey: keys.storeDetailAll() }, (old) =>
        old && old.store.id === storeId ? { ...old, isFavorite: save } : old,
      );
      return { snapshot };
    },
    onError: (_error, _vars, context) => {
      for (const [key, data] of context?.snapshot ?? []) queryClient.setQueryData(key, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.nearbyAll() });
      queryClient.invalidateQueries({ queryKey: keys.storeDetailAll() });
    },
  });
};
