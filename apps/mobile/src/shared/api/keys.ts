import type { Category, OrdersScope } from '@leftover/shared';
import type { SearchArea } from '../store/location';

// Query keys factory — the single source of query keys (rules/state-and-data.md).
// Each branch returns an `as const` array including every input. The `…All` branches are
// prefixes for invalidating every variant at once. Mutations invalidate by these same functions.
export const keys = {
  me: () => ['me'] as const,
  myStats: () => ['me', 'stats'] as const,
  myStore: () => ['stores', 'me'] as const,
  nearbyAll: () => ['bags', 'nearby'] as const,
  /** Discover: every input, so a new location, radius or category refetches. */
  nearby: (p: SearchArea & { category: Category | null }) => ['bags', 'nearby', p] as const,
  storeDetailAll: () => ['stores', 'detail'] as const,
  /** StoreDetail; the location is included because the distance depends on it. */
  storeDetail: (p: { id: string; lat: number; lng: number }) => ['stores', 'detail', p] as const,
  addressSuggestions: (p: { q: string; near: { lat: number; lng: number } | null }) =>
    ['geo', 'autocomplete', p] as const,
  ordersAll: () => ['orders'] as const,
  myOrders: (scope: OrdersScope) => ['orders', 'mine', scope] as const,
  order: (id: string) => ['orders', 'detail', id] as const,
  shopBags: () => ['shop', 'bags'] as const,
  shopOrdersToday: () => ['shop', 'orders', 'today'] as const,
} as const;
