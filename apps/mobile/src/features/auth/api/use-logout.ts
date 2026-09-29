import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../../shared/store/session';
import { logoutRequest } from './requests';

/** Revokes the token server-side, then always clears the device session and cached data. */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const signOut = useSession((s) => s.signOut);
  return useMutation({
    mutationFn: logoutRequest,
    onSettled: async () => {
      await signOut();
      queryClient.clear();
    },
  });
};
