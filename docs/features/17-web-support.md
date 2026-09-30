# Feature: web-support

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
The app runs in a desktop browser from `pnpm dev:web`, so it can be demoed from a computer without a simulator.

### Context
Requested 2026-09-29: the near-term use is a demo run from a computer, and web support should come last in the roadmap. Until then, demos run on the iOS Simulator / Android emulator through Expo Go. Native-only pieces are kept behind small seams so this brief mostly adds `.web.tsx`/`.web.ts` siblings:
- `src/shared/ui/MapPicker` (04/05) uses `react-native-maps`, which has no web support.
- `src/shared/store/session-storage.ts` (03) uses `expo-secure-store`, which has no web support.
- `expo-location` geocoding (`geocodeAsync`/`reverseGeocodeAsync`, 04/05) isn't available on web; `getCurrentPositionAsync` is.

### In scope
- `react-native-web` + `react-dom` via `npx expo install`; `web` output configured in `app.json`; root `pnpm dev:web` script.
- API CORS for the local web dev origin (the Worker currently sends no CORS headers).
- `session-storage.web.ts` using `localStorage` (a demo trade-off: not as safe as the keychain).
- `MapPicker.web.tsx`: decide at the start between an OSM/Leaflet map and a coordinates-only fallback; the radius circle must still render for 05.
- Web geocoding fallback for shop setup (04) and address search (05): decide at the start (e.g. a hosted geocoder behind the API vs. manual pin placement).
- Layout: constrain the app to a phone-width column centred on wide screens.

### Out of scope
- Hosting / deploying the web build.
- SEO, SSR, PWA/offline.
- Desktop-specific layouts.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given `pnpm dev:api` and `pnpm dev:web`, when opening the web URL in Chrome, then Welcome renders with the design's fonts and colors.
- [ ] Given the demo customer login, when logging in on web and reloading, then the session persists and Discover shows seeded bags.
- [ ] Given the shop setup and Location screens on web, then a location can be chosen and saved without native-only APIs.
- [ ] Given the customer-reserve-pickup and store-add-bag journeys, then both complete in the browser.
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass; native builds are unaffected.

### Approach steps
1. Add web deps and config; boot Welcome in the browser.
2. Add CORS to the Worker.
3. Add the web siblings (session storage, MapPicker, geocoding).
4. Walk both journeys in the browser and fix gaps.

### Testing
- Unit: web session storage.
- Integration (API routes): CORS preflight and headers.
- Component: MapPicker.web.
- E2E (Maestro, only if one of the two flows): none (Maestro targets native).

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created: web support requested for computer demos, scheduled after 16
