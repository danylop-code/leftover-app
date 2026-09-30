import { OrderDetail } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

/** Cancels a reservation; the bag is back on sale, so Discover and shop pages refetch too. */
export const useCancelOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest(`/orders/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
        schema: OrderDetail,
      }),
    onSuccess: (order) => queryClient.setQueryData(keys.order(id), order),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.ordersAll() });
      queryClient.invalidateQueries({ queryKey: keys.nearbyAll() });
      queryClient.invalidateQueries({ queryKey: keys.storeDetailAll() });
    },
  });
};
