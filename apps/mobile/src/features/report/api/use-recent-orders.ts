import { MyOrdersResponse, type OrderDetail, REPORT_ORDER_DAYS } from '@leftover/shared';
import { useQueries } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

const DAY_MS = 24 * 60 * 60 * 1000;
const scopes = ['current', 'past'] as const;

/**
 * The customer's orders from the last REPORT_ORDER_DAYS, newest pickup first, for "Which
 * order?". Shares the Orders tab's cache.
 */
export const useRecentOrders = (enabled: boolean): OrderDetail[] => {
  const results = useQueries({
    queries: scopes.map((scope) => ({
      queryKey: keys.myOrders(scope),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        apiRequest('/orders/me', { schema: MyOrdersResponse, query: { scope }, signal }),
      enabled,
    })),
  });
  const since = Date.now() - REPORT_ORDER_DAYS * DAY_MS;
  return results
    .flatMap((r) => r.data?.orders ?? [])
    .filter((o) => new Date(o.bag.pickupStart).getTime() >= since)
    .sort((a, b) => b.bag.pickupStart.localeCompare(a.bag.pickupStart));
};
