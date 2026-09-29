# Feature: location-radius

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A customer picks where to look for food and how far they're willing to go, and that choice drives every distance in the app.

### Context
Artboards **Location** (map, pin, "Where should we look?" sheet, radius slider 1–30 km, "Show results") and **LocationSearch** (search field, "Use my current location", suggestions with distance, recent). Real map via `react-native-maps` with the `MapPicker` built in 04. Shown right after customer registration and whenever the location pill or map button on Discover is pressed.

### In scope
- `src/shared/store/location.ts` (Zustand + persist via `@react-native-async-storage/async-storage`): `{ lat, lng, label, radiusKm, recent[≤5] }`, default radius 5 km.
- `src/shared/constants/location.ts`: radius min 1, max 30, default 5, recent limit 5.
- LocationScreen: MapPicker with radius circle, "use my current location" button, bottom sheet with address label (reverse-geocoded) + Change + radius slider + "Show results".
- LocationSearchScreen: debounced on-device `geocodeAsync`, results labelled via `reverseGeocodeAsync`, distance from the current pin, recent list, clear button, "Use my current location".
- Permission handling: denied → search still works, with an inline banner explaining it.
- Customer without a selected location is routed here before Discover.

### Out of scope
- Hosted geocoding/autocomplete APIs.
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

### Approach steps
1. Write the location store + constants + unit tests.
2. Write the geocoding hooks (`use-geocode-search`, `use-current-position`) wrapping `expo-location`.
3. Build LocationScreen (MapPicker + sheet + slider), then LocationSearchScreen.
4. Add the routing guard for customers without a location.

### Testing
- Unit: store reducer logic (radius clamp, recents dedupe/limit).
- Component: LocationScreen (slider → label, Show results writes the store), LocationSearchScreen (results render with distance, recent tap), with `expo-location` and maps mocked.
- E2E: part of `customer-reserve-pickup` setup (select a seeded location).

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
