# Feature: discover

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A customer sees today's available bags near their selected location, filters by category, and opens one.

### Context
Artboards **Discover** (location pill with radius, map button, "Rescue something tasty", category chips, "Pick up today · N bags", BagCards with stock badge, pickup window, rating, distance, old/new price, tab bar), **DiscoverLoading** (skeletons, "Finding bags…"), **DiscoverEmpty** ("Nothing nearby right now", Change location, Show all categories), **DiscoverError** (offline, Try again).

### In scope
- API `GET /bags/nearby?lat&lng&radiusKm&category?` (`requireAuth`): bounding-box prefilter in SQL, `haversineKm` filter + sort by distance in `src/services/discovery.ts`; only active bags with `qty_available > 0` and `pickup_end > now`; returns bag + store summary + `distanceKm`.
- Shared `NearbyQuery`, `NearbyBag` schemas.
- Mobile `src/features/discover`: DiscoverScreen, `useNearbyBags({ lat, lng, radiusKm, category })` (key from factory incl. every param), category ChipRow ("All" + the enum, without `other`), location pill → Location, map button → Location.
- Loading (skeletons), empty (with and without category filter — "Show all categories" only when filtered), error (network vs server copy, Try again → refetch), pull-to-refresh.
- Customer tab bar: Discover / Orders / Profile.
- BagCard shows the rating only once 13 exists (hidden when null) and the heart only once 14 exists.

### Out of scope
- Map view of results.
- Sorting options, search by text.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given bags at 0.8 km and 1.4 km and a 5 km radius, then both show, nearest first, with distances computed from the selected location.
- [ ] Given a bag at 6 km and a 5 km radius, then it's excluded.
- [ ] Given a sold-out, paused, or past-window bag, then it's excluded.
- [ ] Given the "Bakery" chip, then only bakery bags show and the count reflects the filter.
- [ ] Given the selected location changes, then the list refetches, and no distance from the previous location is ever displayed.
- [ ] Given no results with a category filter, then the empty state shows "Show all categories", which resets the filter.
- [ ] Given a network failure, then the error state shows, and Try again refetches.
- [ ] Given a stock of 1, then the badge uses the low-stock style.

### Approach steps
1. Write the shared schemas + discovery service (bbox + haversine) with unit tests.
2. Add the route + integration tests with seeded coordinates.
3. Add the query hook + keys.
4. Build the screen states + tab layout.

### Testing
- Unit: bounding-box math, filter/sort in the service with a frozen clock.
- Integration: `test/bags-nearby.test.ts` (radius, category, exclusions, auth required, invalid lat/lng → 400).
- Component: DiscoverScreen loading/empty/error/list, chip filtering, low-stock badge.
- E2E: `customer-reserve-pickup` opens a bag from this list.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
