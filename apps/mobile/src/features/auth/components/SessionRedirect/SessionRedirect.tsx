import { Redirect } from 'expo-router';
import { useSession } from '../../../../shared/store/session';

/**
 * The routing hub (app/index): signed out → Welcome; customer → Discover (Location right after
 * registering, until 05 gates on a saved location); shop owner → Bags, or shop setup while they
 * have no shop (04).
 */
export function SessionRedirect() {
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  const justRegistered = useSession((s) => s.justRegistered);
  if (status === 'hydrating') return null;
  if (status === 'signedOut' || !user) return <Redirect href="/welcome" />;
  if (user.role === 'customer')
    return <Redirect href={justRegistered ? '/location' : '/discover'} />;
  return <Redirect href={user.storeId ? '/bags' : '/setup'} />;
}
