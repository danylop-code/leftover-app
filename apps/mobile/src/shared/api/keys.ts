import type { SearchArea } from '../store/location';

// Query keys factory — the single source of query keys (rules/state-and-data.md).
// Each branch returns an `as const` array including every input, e.g.
//   nearby: (p: { lat: number; lng: number; radiusKm: number; category?: string }) =>
//     ['bags', 'nearby', p] as const,
// Mutations invalidate by these same functions.
export const keys = {
  me: () => ['me'] as const,
  myStore: () => ['stores', 'me'] as const,
  /** Discover (06). Includes the whole area, so a new location or radius refetches. */
  nearby: (area: SearchArea) => ['bags', 'nearby', area] as const,
  addressSuggestions: (p: { q: string; near: { lat: number; lng: number } | null }) =>
    ['geo', 'autocomplete', p] as const,
} as const;
