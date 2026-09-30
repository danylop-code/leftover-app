import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { useSession } from '../../../../shared/store/session';

type Props = {
  /** `shop`: the store tabs (needs a shop). `noShop`: the setup screen (only before setup). */
  need: 'shop' | 'noShop';
  children: ReactNode;
};

/** A shop owner without a shop always lands on setup; once set up, setup sends them to My bags. */
export function ShopGate({ need, children }: Props) {
  const hasShop = useSession((s) => Boolean(s.user?.storeId));
  if (need === 'shop' && !hasShop) return <Redirect href="/setup" />;
  if (need === 'noShop' && hasShop) return <Redirect href="/bags" />;
  return children;
}
