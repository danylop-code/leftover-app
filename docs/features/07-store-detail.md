# Feature: store-detail

## Plan — FROZEN (changes go in Changelog)

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
- [x] Given a store with 3 bags today, 1 sold out, then "2 of 3" shows, the sold-out row reads "Sold out · Back tomorrow" and is disabled.
- [x] Given now outside opening hours in the store's timezone, then the header says the store is closed (copy from `en.json`).
- [x] Given the selected location, then the distance is computed from it.
- [x] Given Directions, then the maps app opens at the store's coordinates.
- [x] Given an unknown store id, then 404, and the screen shows an error state with Back.
- [x] Given no ratings yet, then the ratings section is hidden (no "0.0").

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
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — plan frozen; work started on `feat/07-store-detail` (after 06; 18 still pending at the user's request). Decisions: `openToday` becomes `openStatus: 'open' | 'beforeOpening' | 'afterClosing'` so the header can say when it opens; `rating` is `{ average, count } | null` and reviews aren't in the response until 13 defines them; `lat`/`lng` are required. Tapping an available bag goes to Reserve, which 08 builds (until then it does nothing). Route: `/store/[id]`, opened from Discover's cards.
- 2026-09-29 — done. Decisions and deviations:
  - Bags list available ones first, then sold-out, each by pickup start (the artboard's order). "Today" is every bag whose window hasn't ended, as the brief says, so a bag for tomorrow morning shows too.
  - Closed copy: "Closed now · opens at 08:00" (before opening) and "Closed now · opens tomorrow at 08:00" (after closing). Not in the design.
  - The address card shows the address and "0.8 km away"; the design's city ("Lviv ·") is left out because stores don't store a city.
  - Share and Save (heart) are hidden: Share is out of scope, Save comes with 14. Ratings show the average/count row and a summary card once `rating` exists; per-aspect bars and reviews come with 13.
  - Tapping an available bag does nothing until 08 builds Reserve. Discover's cards now open `/store/[id]`.
  - Not found (404) shows "This shop isn't available" with Go back; network/server errors show Try again.
  - Kit additions: `StoreLogo` size `xl` (80 px, background ring), `CategoryMedia` variant `hero` (240 px), `BagRow` passes `accessibilityLabel` to disabled rows, `Star` exported; `directionsUrl` in `src/shared/lib`.
