import { Store, type StoreProfileBody } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { keys } from '../../../shared/api/keys';
import { useSession } from '../../../shared/store/session';

/**
 * Creates the owner's shop. `enterShop` records the storeId on the session, which sends routing
 * on to My bags; the screen calls it once the optional photos are uploaded (brief 20).
 */
export const useCreateStore = () => {
  const queryClient = useQueryClient();
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  const enterShop = async (store: Store) => {
    if (user) await setUser({ ...user, storeId: store.id });
  };
  const mutation = useMutation({
    mutationFn: (body: StoreProfileBody) =>
      apiRequest('/stores/me', { method: 'POST', body, schema: Store }),
    onSuccess: (store) => {
      queryClient.setQueryData(keys.myStore(), store);
    },
    onError: (error) => {
      // Already set up (e.g. a double submit): refresh /me, which carries the storeId.
      if (error instanceof ApiError && error.code === 'store_exists') {
        queryClient.invalidateQueries({ queryKey: keys.me() });
      }
    },
  });
  return { ...mutation, enterShop };
};
