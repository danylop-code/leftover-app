import { type CreateOrderBody, Order } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

/**
 * Reserves bags. Success or not, stock changed somewhere, so Discover, shop pages and the
 * customer's orders are refetched.
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderBody) =>
      apiRequest('/orders', { method: 'POST', body, schema: Order }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.nearbyAll() });
      queryClient.invalidateQueries({ queryKey: keys.storeDetailAll() });
      queryClient.invalidateQueries({ queryKey: keys.ordersAll() });
    },
  });
};
