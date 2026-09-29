// Query keys factory — the single source of query keys (rules/state-and-data.md).
// Each branch returns an `as const` array including every input, e.g.
//   nearby: (p: { lat: number; lng: number; radiusKm: number; category?: string }) =>
//     ['bags', 'nearby', p] as const,
// Mutations invalidate by these same functions.
export const keys = {
  me: () => ['me'] as const,
} as const;
