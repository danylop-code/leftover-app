// Query keys factory — the single source of query keys (rules/state-and-data.md).
// Each feature adds a branch returning `as const` arrays that include every input, e.g.
//   nearby: (p: { lat: number; lng: number; radiusKm: number; category?: string }) =>
//     ['bags', 'nearby', p] as const,
// Mutations invalidate by these same functions.
export const keys = {} as const;
