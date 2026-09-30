import type { NearbyResponse, SavedShopsResponse, StoreDetail } from '@leftover/shared';
import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, NoContent } from './client';
import { keys } from './keys';

type Vars = { storeId: string; save: boolean };

/**
 * Saves or unsaves a shop. The heart flips at once in every cached Discover list, shop page
 * and the Saved tab; on failure the caches roll back (the caller shows the toast).
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
        queryClient.cancelQueries({ queryKey: keys.savedAll() }),
      ]);
      const snapshot: [QueryKey, unknown][] = [
        ...queryClient.getQueriesData({ queryKey: keys.nearbyAll() }),
        ...queryClient.getQueriesData({ queryKey: keys.storeDetailAll() }),
        ...queryClient.getQueriesData({ queryKey: keys.savedAll() }),
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
      // Unsaving drops the shop from the Saved tab at once (saving adds it on the refetch).
      if (!save)
        queryClient.setQueriesData<SavedShopsResponse>({ queryKey: keys.savedAll() }, (old) =>
          old ? { shops: old.shops.filter((s) => s.store.id !== storeId) } : old,
        );
      return { snapshot };
    },
    onError: (_error, _vars, context) => {
      for (const [key, data] of context?.snapshot ?? []) queryClient.setQueryData(key, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.nearbyAll() });
      queryClient.invalidateQueries({ queryKey: keys.storeDetailAll() });
      queryClient.invalidateQueries({ queryKey: keys.savedAll() });
    },
  });
};
