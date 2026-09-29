import type { ReviewBody } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, NoContent } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

/** Sends the review; the order, the orders list and the shop's ratings all change. */
export const useSubmitReview = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewBody) =>
      apiRequest(`/orders/${encodeURIComponent(orderId)}/review`, {
        method: 'POST',
        body,
        schema: NoContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: keys.ordersAll() });
      queryClient.invalidateQueries({ queryKey: keys.storeDetailAll() });
      queryClient.invalidateQueries({ queryKey: keys.nearbyAll() });
    },
  });
};
