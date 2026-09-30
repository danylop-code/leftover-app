import { Redirect } from 'expo-router';
import { useSession } from '../../../../shared/store/session';

/**
 * The routing hub (app/index): signed out → Welcome; customer → Discover; store → Bags.
 * Right after registering: customer → Location (05), store → shop setup (04).
 */
export function SessionRedirect() {
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  const justRegistered = useSession((s) => s.justRegistered);
  if (status === 'hydrating') return null;
  if (status === 'signedOut' || !user) return <Redirect href="/welcome" />;
  if (user.role === 'customer')
    return <Redirect href={justRegistered ? '/location' : '/discover'} />;
  return <Redirect href={justRegistered ? '/setup' : '/bags'} />;
}
