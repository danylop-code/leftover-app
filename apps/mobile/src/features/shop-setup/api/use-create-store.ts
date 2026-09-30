import { Store, type StoreProfileBody } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';
import { useSession } from '../../../shared/store/session';

/** Creates the owner's shop; recording storeId on the session sends routing on to My bags. */
export const useCreateStore = () => {
  const queryClient = useQueryClient();
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  return useMutation({
    mutationFn: (body: StoreProfileBody) =>
      apiRequest('/stores/me', { method: 'POST', body, schema: Store }),
    onSuccess: async (store) => {
      queryClient.setQueryData(keys.myStore(), store);
      if (user) await setUser({ ...user, storeId: store.id });
    },
    onError: (error) => {
      // Already set up (e.g. a double submit): refresh /me, which carries the storeId.
      if (error instanceof ApiError && error.code === 'store_exists') {
        queryClient.invalidateQueries({ queryKey: keys.me() });
      }
    },
  });
};
