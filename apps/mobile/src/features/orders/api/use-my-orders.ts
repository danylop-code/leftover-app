import { MyOrdersResponse, type OrdersScope } from '@leftover/shared';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

/** The customer's current or past orders, plus the current count for the segment badge. */
export const useMyOrders = (scope: OrdersScope) =>
  useQuery({
    queryKey: keys.myOrders(scope),
    queryFn: ({ signal }) =>
      apiRequest('/orders/me', { schema: MyOrdersResponse, query: { scope }, signal }),
  });
