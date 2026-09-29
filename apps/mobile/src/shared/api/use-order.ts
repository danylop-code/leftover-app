import { OrderDetail } from '@leftover/shared';
import { useQuery } from '@tanstack/react-query';
import { ORDER_POLL_MS } from '../constants/orders';
import { apiRequest } from './client';
import { keys } from './keys';

/** Poll while the order waits for pickup; stop once it's collected, cancelled or missed. */
export const orderPollInterval = (order: OrderDetail | undefined) =>
  order?.displayStatus === 'reserved' || order?.displayStatus === 'ready' ? ORDER_POLL_MS : false;

/**
 * One of the customer's orders (Pickup, Review). While it waits for pickup it's re-checked
 * every ORDER_POLL_MS, so "collected" appears soon after the shop confirms the code.
 */
export const useOrder = (id: string) =>
  useQuery({
    queryKey: keys.order(id),
    queryFn: ({ signal }) =>
      apiRequest(`/orders/${encodeURIComponent(id)}`, { schema: OrderDetail, signal }),
    refetchInterval: (query) => orderPollInterval(query.state.data),
  });
