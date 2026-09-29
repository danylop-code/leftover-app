import { Me, MeStats, Store, type UpdateMeBody } from '@leftover/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';
import { useSession } from '../../../shared/store/session';

/** Bags rescued and money saved (customers only). */
export const useMyStats = (enabled: boolean) =>
  useQuery({
    queryKey: keys.myStats(),
    queryFn: ({ signal }) => apiRequest('/me/stats', { schema: MeStats, signal }),
    enabled,
  });

/** Renames the user; the session keeps the new name for the next cold start. */
export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  const setUser = useSession((s) => s.setUser);
  return useMutation({
    mutationFn: (body: UpdateMeBody) => apiRequest('/me', { method: 'PATCH', body, schema: Me }),
    onSuccess: async (me) => {
      queryClient.setQueryData(keys.me(), me);
      await setUser(me);
    },
  });
};

/** The shop owner's own shop, for its photos (20). */
export const useMyShop = (enabled: boolean) =>
  useQuery({
    queryKey: keys.myStore(),
    queryFn: ({ signal }) => apiRequest('/stores/me', { schema: Store, signal }),
    enabled,
  });
