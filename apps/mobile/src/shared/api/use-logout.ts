import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../store/session';
import { apiRequest, NoContent } from './client';

const logoutRequest = () => apiRequest('/auth/logout', { method: 'POST', schema: NoContent });

/**
 * Shared because several features offer Log out (auth placeholder, shop setup, profile).
 * Revokes the token server-side, then always clears the device session and cached data. */
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
