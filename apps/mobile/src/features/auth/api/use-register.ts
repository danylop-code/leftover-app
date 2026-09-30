import type { RegisterBody } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '../../../shared/api/keys';
import { useSession } from '../../../shared/store/session';
import { registerRequest } from './requests';

/** Creates the account and signs in; routing to onboarding follows from the session change. */
export const useRegister = () => {
  const queryClient = useQueryClient();
  const signIn = useSession((s) => s.signIn);
  return useMutation({
    mutationFn: (body: RegisterBody) => registerRequest(body),
    onSuccess: async (session) => {
      queryClient.setQueryData(keys.me(), session.user);
      await signIn(session, { justRegistered: true });
    },
  });
};
