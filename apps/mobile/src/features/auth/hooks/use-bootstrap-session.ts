import { useEffect } from 'react';
import { useSession } from '../../../shared/store/session';
import { useMe } from '../api/use-me';

/**
 * Restores the stored session on launch (no network needed to route), then refreshes the user
 * from GET /me. An expired or revoked token gets 401 there, which signs out.
 * Returns true once the stored session has been read.
 */
export const useBootstrapSession = () => {
  const status = useSession((s) => s.status);
  const hydrate = useSession((s) => s.hydrate);
  const setUser = useSession((s) => s.setUser);
  const me = useMe();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (me.data) setUser(me.data);
  }, [me.data, setUser]);

  return status !== 'hydrating';
};
