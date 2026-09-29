import type { LoginBody } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '../../../shared/api/keys';
import { useSession } from '../../../shared/store/session';
import { loginRequest } from './requests';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const signIn = useSession((s) => s.signIn);
  return useMutation({
    mutationFn: (body: LoginBody) => loginRequest(body),
    onSuccess: async (session) => {
      queryClient.setQueryData(keys.me(), session.user);
      await signIn(session);
    },
  });
};
