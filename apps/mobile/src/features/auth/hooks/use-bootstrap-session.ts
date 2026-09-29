import { useEffect, useState } from 'react';
import { useLocation } from '../../../shared/store/location';
import { useSession } from '../../../shared/store/session';
import { useMe } from '../api/use-me';

/**
 * Restores the stored session and search location on launch (no network needed to route),
 * then refreshes the user from GET /me. An expired or revoked token gets 401 there, which
 * signs out. Returns true once both have been read.
 */
export const useBootstrapSession = () => {
  const status = useSession((s) => s.status);
  const hydrate = useSession((s) => s.hydrate);
  const setUser = useSession((s) => s.setUser);
  const me = useMe();
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    Promise.resolve(useLocation.persist.rehydrate()).finally(() => setLocationReady(true));
  }, []);

  useEffect(() => {
    if (me.data) setUser(me.data);
  }, [me.data, setUser]);

  return status !== 'hydrating' && locationReady;
};
