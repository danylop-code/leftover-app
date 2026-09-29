import type { Role } from '@leftover/shared';
import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { useSession } from '../../../../shared/store/session';

type Props = {
  /** `guest`: only signed-out users (the auth screens). */
  allow: Role | 'guest';
  children: ReactNode;
};

/** Guards a route group; anyone else goes back to the hub, which routes them correctly. */
export function RoleGate({ allow, children }: Props) {
  const status = useSession((s) => s.status);
  const role = useSession((s) => s.user?.role);
  if (status === 'hydrating') return null;
  const allowed =
    allow === 'guest' ? status === 'signedOut' : status === 'signedIn' && role === allow;
  if (!allowed) return <Redirect href="/" />;
  return children;
}
