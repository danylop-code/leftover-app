import { type ConfirmCodeBody, StoreOrder, StoreOrdersToday } from '@leftover/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

/** The shop's orders for today, to collect first. */
export const useTodaysOrders = () =>
  useQuery({
    queryKey: keys.shopOrdersToday(),
    queryFn: ({ signal }) =>
      apiRequest('/store/orders/today', { schema: StoreOrdersToday, signal }),
  });

/** Confirms a pickup code; the list and the shop's stats move on. */
export const useConfirmCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ConfirmCodeBody) =>
      apiRequest('/store/orders/confirm', { method: 'POST', body, schema: StoreOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.shopOrdersToday() });
      queryClient.invalidateQueries({ queryKey: keys.shopBags() });
    },
  });
};
