# Feature: location-radius

## Plan — FROZEN (changes go in Changelog)

### Goal
A customer picks where to look for food and how far they're willing to go, and that choice drives every distance in the app.

### Context
Artboards **Location** (map, pin, "Where should we look?" sheet, radius slider 1–30 km, "Show results") and **LocationSearch** (search field, "Use my current location", suggestions with distance, recent). Real map via `react-native-maps` with the `MapPicker` built in 04. Shown right after customer registration and whenever the location pill or map button on Discover is pressed.

### In scope
- `src/shared/store/location.ts` (Zustand + persist via `@react-native-async-storage/async-storage`): `{ lat, lng, label, radiusKm, recent[≤5] }`, default radius 5 km.
- `src/shared/constants/location.ts`: radius min 1, max 30, default 5, recent limit 5.
- LocationScreen: MapPicker with radius circle, "use my current location" button, bottom sheet with address label (reverse-geocoded) + Change + radius slider + "Show results".
- Address autocomplete (requested 2026-09-29): suggestions update while typing, through a hosted provider proxied by the API (`GET /geo/autocomplete?q&lat&lng`, signed-in users only), so any provider key stays server-side and web (17) gets the same results. **Decided 2026-09-29:** Photon (OpenStreetMap, komoot's public instance at `PHOTON_URL`), no key, fair-use; results biased to the current pin and sorted nearest first. The provider sits behind one adapter (`src/services/geo/`), so self-hosting Photon or switching to Mapbox/Google later touches one file. Photon suggestions already carry coordinates, so there is no `GET /geo/place/:id` (add it with a provider that needs a details call).
- LocationSearchScreen: debounced autocomplete suggestions, distance from the current pin, recent list, clear button, "Use my current location". On-device `geocodeAsync`/`reverseGeocodeAsync` remain the fallback when the provider is unavailable, and label the pin after "use my current location".
- Shop setup (04) address field switches to the same autocomplete (shared component in `src/shared/ui`), replacing search-on-submit.
- Permission handling: denied → search still works, with an inline banner explaining it.
- Customer without a selected location is routed here before Discover. This replaces 03's `justRegistered` flag; the location store is cleared on logout, so a new account on the same device starts here too.

### Out of scope
- Place details beyond coordinates and a label (opening hours, photos).
- Showing shops on this map (the design's shop dots are decorative).
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a first-time customer, when registration completes, then the Location screen shows and Discover is unreachable until "Show results".
- [ ] Given location permission granted, when "use my current location" is tapped, then the pin moves to the device position and the label updates.
- [ ] Given permission denied, then a banner explains it and search remains usable.
- [ ] Given the slider, when moved, then the radius label and circle update in 1 km steps within 1–30.
- [ ] Given a search result is chosen, then the pin moves there, the label updates, and the entry is added to the top of recents (deduped, max 5).
- [ ] Given "Show results", then the store holds the new lat/lng/radius, and the Discover query key changes so it refetches (no stale distances — see `gotchas.md`).
- [ ] Given an app restart, then the last location and radius are restored.
- [ ] Given a partial address ("Dorosh"), when typing pauses, then suggestions from the provider appear, nearest to the current pin first, and choosing one moves the pin and sets the label.
- [ ] Given the provider fails or times out, then search falls back to on-device geocoding and still works.
- [ ] Given the provider key, then it never reaches the app (all provider calls go through the API).
- [ ] Given shop setup (04), then its address field offers the same suggestions.

### Approach steps
1. Write the location store + constants + unit tests.
2. Add the API proxy route (Photon adapter) + integration tests (provider mocked); write the shared `AddressAutocomplete` field and the hooks (`use-address-suggestions`, `use-current-position`), with `expo-location` as the fallback.
3. Build LocationScreen (MapPicker + sheet + slider), then LocationSearchScreen.
4. Add the routing guard for customers without a location.
5. Swap shop setup's address field to `AddressAutocomplete`.

### Testing
- Unit: store reducer logic (radius clamp, recents dedupe/limit).
- Component: LocationScreen (slider → label, Show results writes the store), LocationSearchScreen (results render with distance, recent tap), with `expo-location` and maps mocked.
- E2E: part of `customer-reserve-pickup` setup (select a seeded location).

---

## Status
in-progress

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — plan amended (not yet frozen): address autocomplete via a hosted provider behind the API, also used by shop setup; hosted geocoding moved from out of scope to in scope
- 2026-09-29 — provider decided (Photon, no key); `/geo/place/:id` dropped because suggestions carry coordinates; `justRegistered` replaced by the location gate. Plan frozen; work started on `feat/05-location-radius`
