import { Redirect } from 'expo-router';
import { useLocation } from '../../../../shared/store/location';
import { useSession } from '../../../../shared/store/session';

/**
 * The routing hub (app/index): signed out → Welcome; customer → Discover, or Location until
 * they've chosen where to look (05); shop owner → Bags, or shop setup while they have no shop (04).
 */
export function SessionRedirect() {
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  const hasLocation = useLocation((s) => s.selected !== null);
  if (status === 'hydrating') return null;
  if (status === 'signedOut' || !user) return <Redirect href="/welcome" />;
  if (user.role === 'customer') return <Redirect href={hasLocation ? '/discover' : '/location'} />;
  return <Redirect href={user.storeId ? '/bags' : '/setup'} />;
}
