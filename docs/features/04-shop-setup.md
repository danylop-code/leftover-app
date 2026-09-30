# Feature: shop-setup

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A newly registered shop owner describes their shop once, so its bags can appear to nearby customers.

### Context
**Not in the design.** It follows Register when role = shop. Built only from 01's kit, matching the visual language of Register/AddBag (header with back button, display title, fields, primary block button). Introduces the map dependency that 05 reuses.

### In scope
- API `src/routes/stores.ts`: `POST /stores/me` (create, one per owner), `PATCH /stores/me`, `GET /stores/me` — `requireRole('store')`.
- Shared `StoreProfileBody`: name 2–60, category (shared enum), address 3–120, lat/lng in range, opensAt/closesAt `HH:mm` with closes > opens, timezone (default `Europe/Kyiv`).
- `react-native-maps` + `expo-location` installed via `npx expo install`; config plugin + permissions strings in `app.json`.
- `src/shared/ui/MapPicker`: map with a centered draggable pin, optional radius circle (used by 05).
- Mobile `src/features/shop-setup`: ShopSetupScreen — name, category chips, address field (on-device `geocodeAsync` to position the pin), MapPicker to fine-tune, opening hours from/until, Save.
- Store role routing: a store user without a shop profile is always redirected to setup.

### Out of scope
- Logo upload (the logo shows the initial letter, as in the design).
- Multiple shops per owner, per-day opening hours.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [x] Given a store user with no shop, when opening the app, then shop setup is shown and the tabs are unreachable.
- [x] Given valid fields, when saving, then 201, and the app lands on My bags (11's empty state).
- [x] Given an address, when geocoded, then the pin moves there; dragging the pin updates lat/lng without changing the typed address.
- [x] Given closing time ≤ opening time, then an inline error blocks save and the API rejects with 400.
- [x] Given an owner who already has a shop, when `POST /stores/me`, then 409 `store_exists`.
- [x] Given a customer token, when calling `/stores/me`, then 403.

### Approach steps
1. Write the shared schema + routes + service + integration tests.
2. Install maps/location; update the app config; add `gotchas.md` notes (Android Maps key, dev build).
3. Build MapPicker (shared/ui).
4. Build the setup screen + hooks + redirect guard.

### Testing
- Unit: hours validation (closes > opens, format).
- Integration: `test/stores-me.test.ts` (create, duplicate, patch, role guard, validation).
- Component: ShopSetupScreen validation and submit; MapPicker mocked.
- E2E: none (the `store-add-bag` flow starts from a seeded shop).

---

## Status
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — plan frozen; work started on `feat/04-shop-setup`
- 2026-09-29 — done. Decisions and deviations:
  - `Me` gained `storeId` (null until setup), returned by `/me`, register and login. Routing uses it: a shop owner without a shop always lands on setup (`ShopGate` keeps the tabs unreachable), and a set-up owner is sent from setup to My bags. This replaces 03's `justRegistered` flag for shops; customers keep it until 05.
  - "Lands on My bags (11's empty state)": lands on the Bags route, which shows the placeholder until 11.
  - Address → pin: on-device `geocodeAsync` when the owner submits or leaves the address field. Saving requires the pin to have been placed (found or dragged). Autocomplete was requested after the demo and is planned in 05, which will swap this field over.
  - Opening hours are typed `HH:mm` inputs; `8:00`, `8.30` and `9` are normalised (`src/shared/lib/time.ts`, reusable by 11).
  - `MapPicker` is a draggable `Marker` (drag or tap the map), not a fixed centre pin; it recentres only on outside changes. Native only; 17 adds a web sibling.
  - `useLogout` moved to `src/shared/api` so setup can offer Log out (header), as profile (15) will.
  - `PATCH /stores/me` re-validates the merged profile (hours stay valid). `GET /stores/me` was added for later screens.
  - Not in the design: Log out in the setup header, and the pin status line under the map.
  - Found in the first simulator demo and fixed in the kit: single-line `Input` text sat below centre on iOS.
