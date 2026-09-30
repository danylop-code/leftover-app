import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { useLocation } from '../../../../shared/store/location';

/** Keeps the customer tabs unreachable until a search location has been chosen. */
export function LocationGate({ children }: { children: ReactNode }) {
  const hasLocation = useLocation((s) => s.selected !== null);
  if (!hasLocation) return <Redirect href="/location" />;
  return children;
}
