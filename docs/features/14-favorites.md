# Feature: favorites

## Plan — FROZEN (changes go in Changelog)

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
- [x] Given an unsaved shop, when the heart is tapped, then it fills immediately, and after refetch `isFavorite` is true.
- [x] Given PUT twice, then 204 both times and one row exists.
- [x] Given a network error on toggle, then the heart reverts and a toast explains it.
- [x] Given a favorited shop, then all of its BagCards on Discover show the filled heart.
- [x] Given an unknown store id, then 404.

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
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — done on `feat/08-15-customer-and-store`. Decisions and deviations:
  - Built in the 08–15 batch. Migration `0001_reviews_favorites`.
  - `FavoriteButton` and `useToggleFavorite` live in `src/shared` (Discover and StoreDetail both use them; features can't import each other). The heart fills at once in every cached list and shop page and rolls back with a toast on failure.
  - The StoreDetail header shows Back and the heart; Share stays hidden (out of scope in 07).
