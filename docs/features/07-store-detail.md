# Feature: store-detail

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A customer sees what a shop offers today, where it is, and whether it's any good, and can move on to reserve.

### Context
Artboard **StoreDetail** (full scroll): back/header actions, logo, name, category, "Open today 08:00–20:00", rating + count, address + distance + Directions, "Available today · 2 of 3" with BagRows (available and sold-out "Back tomorrow"), Ratings breakdown, Recent reviews.

### In scope
- API `GET /stores/:id?lat&lng` (`requireAuth`): store profile, `distanceKm`, `openToday` (computed in the store's timezone), today's bags (active, `pickup_end > now`) incl. sold-out, counts `{ available, total }`.
- Shared `StoreDetail` schema, with `rating` fields nullable (filled by 13).
- Mobile `src/features/store-detail`: StoreDetailScreen, `useStoreDetail(id, location)`; tapping an available bag → Reserve (08); sold-out rows aren't tappable.
- Directions: opens the platform maps app with the store's coordinates (`Linking`).
- Ratings section + recent reviews render only when data exists (13 fills them).

### Out of scope
- Share button (hidden).
- "See all" reviews list (lands with 13 if time allows; otherwise hidden).
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a store with 3 bags today, 1 sold out, then "2 of 3" shows, the sold-out row reads "Sold out · Back tomorrow" and is disabled.
- [ ] Given now outside opening hours in the store's timezone, then the header says the store is closed (copy from `en.json`).
- [ ] Given the selected location, then the distance is computed from it.
- [ ] Given Directions, then the maps app opens at the store's coordinates.
- [ ] Given an unknown store id, then 404, and the screen shows an error state with Back.
- [ ] Given no ratings yet, then the ratings section is hidden (no "0.0").

### Approach steps
1. Write the shared schema + service + route + integration tests.
2. Add the hook + keys.
3. Build the screen (header, info, bag list, conditional ratings).

### Testing
- Unit: `openToday` across timezone/day boundaries.
- Integration: `test/store-detail.test.ts` (counts, sold-out included, past-window excluded, 404).
- Component: StoreDetailScreen (sold-out row disabled, ratings hidden when null, Directions calls Linking).
- E2E: `customer-reserve-pickup` passes through here.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
