# Feature: favorites

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A customer can save shops they like with one tap.

### Context
The heart "Save <shop>" button on the **Discover** BagCard media and in the **StoreDetail** header. There's no designed favorites list, so this brief is the toggle and its persistence only.

### In scope
- Migration: `favorites(user_id, store_id, created_at, PK(user_id, store_id))`.
- API (`requireRole('customer')`): `PUT /favorites/:storeId` (idempotent), `DELETE /favorites/:storeId` (idempotent); an `isFavorite` flag added to `/bags/nearby` items and `/stores/:id`.
- Mobile `src/features/favorites`: `useToggleFavorite` with an optimistic update across the nearby and store-detail caches (rolled back on error with a toast); a `FavoriteButton` wired into BagCard and the StoreDetail header, with `accessibilityState.selected` and the label "Save/Unsave <shop>".

### Out of scope
- Favorites list/filter screen.
- Notifications for favorite shops.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given an unsaved shop, when the heart is tapped, then it fills immediately, and after refetch `isFavorite` is true.
- [ ] Given PUT twice, then 204 both times and one row exists.
- [ ] Given a network error on toggle, then the heart reverts and a toast explains it.
- [ ] Given a favorited shop, then all of its BagCards on Discover show the filled heart.
- [ ] Given an unknown store id, then 404.

### Approach steps
1. Write the migration + routes + integration tests.
2. Extend the nearby/detail responses with `isFavorite` (update their tests).
3. Add the hook with optimistic cache updates + FavoriteButton.

### Testing
- Integration: `test/favorites.test.ts` (idempotency, flag in nearby/detail, isolation between users).
- Component: FavoriteButton optimistic toggle + rollback.
- E2E: none.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
