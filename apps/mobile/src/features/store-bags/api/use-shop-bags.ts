import { ShopBagsResponse } from '@leftover/shared';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';

/** The shop's bags for today (and later), with the header stats. */
export const useShopBags = () =>
  useQuery({
    queryKey: keys.shopBags(),
    queryFn: ({ signal }) => apiRequest('/store/bags', { schema: ShopBagsResponse, signal }),
  });
