import { type BagBody, type BagPatch, ShopBag, type ShopBagsResponse } from '@leftover/shared';
import { type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, NoContent } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

// What customers see changes with any bag edit, so Discover and shop pages refetch too.
const refreshAfterBagChange = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: keys.shopBags() });
  queryClient.invalidateQueries({ queryKey: keys.nearbyAll() });
  queryClient.invalidateQueries({ queryKey: keys.storeDetailAll() });
};

/** Adds a bag (no id) or saves an edit. */
export const useSaveBag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: BagBody | BagPatch }) =>
      id
        ? apiRequest(`/store/bags/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body,
            schema: ShopBag,
          })
        : apiRequest('/store/bags', { method: 'POST', body, schema: ShopBag }),
    onSuccess: () => refreshAfterBagChange(queryClient),
  });
};

/**
 * Pauses or resumes a bag straight from the list: the row flips at once and rolls back if the
 * request fails.
 */
export const useToggleBag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest(`/store/bags/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { isActive },
        schema: ShopBag,
      }),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: keys.shopBags() });
      const previous = queryClient.getQueryData<ShopBagsResponse>(keys.shopBags());
      queryClient.setQueryData<ShopBagsResponse>(keys.shopBags(), (old) =>
        old ? { ...old, bags: old.bags.map((b) => (b.id === id ? { ...b, isActive } : b)) } : old,
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(keys.shopBags(), context.previous);
    },
    onSettled: () => refreshAfterBagChange(queryClient),
  });
};

export const useDeleteBag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/store/bags/${encodeURIComponent(id)}`, { method: 'DELETE', schema: NoContent }),
    onSuccess: () => refreshAfterBagChange(queryClient),
  });
};
