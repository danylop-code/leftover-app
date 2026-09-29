import type { ReactNode } from 'react';

/** Native: the app fills the screen. The web sibling centres a phone-width column. */
export function AppFrame({ children }: { children: ReactNode }) {
  return children;
}
