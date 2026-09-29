import { useQuery } from '@tanstack/react-query';
import { keys } from '../../../shared/api/keys';
import { useSession } from '../../../shared/store/session';
import { meRequest } from './requests';

/** The signed-in user from GET /me; only runs with a session. A 401 signs out (client.ts). */
export const useMe = () => {
  const signedIn = useSession((s) => s.status === 'signedIn');
  return useQuery({
    queryKey: keys.me(),
    queryFn: ({ signal }) => meRequest(signal),
    enabled: signedIn,
  });
};
