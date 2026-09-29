# Feature: profile-settings

## Plan — FROZEN (changes go in Changelog)

### Goal
A user sees who they're logged in as and their impact, adjusts their pickup area, gets help, and logs out.

### Context
Artboard **Settings** (Profile tab: initials avatar, name, email, edit button, stats "12 bags rescued" / "₴3,480 saved so far", Preferences: Language English, Pickup area "Lviv · 5 km", Notifications On; Help: Report a problem, Log out; "Leftover 1.0.0"). Shops get the same screen in their Profile tab, without customer stats or pickup area.

### In scope
- API `GET /me/stats` (customer): `bagsRescued` = Σ qty of collected orders, `savedMinor` = Σ (unit_original − unit_price) × qty of collected orders.
- Mobile `src/features/profile`: ProfileScreen for both roles; Pickup area row → Location (05) showing the city/label + radius from the location store; Language row display-only ("English", not pressable); Report a problem → 16; Log out → 03's `useLogout` with a confirm sheet; app version from `expo-constants`.
- Edit name: an inline sheet with `PATCH /me { firstName }`.

### Out of scope
- **Notifications row: not rendered** (no push in MVP; a switch that does nothing would mislead).
- Changing email/password, deleting the account.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [x] Given 3 collected orders (1, 1, 2 bags) saving ₴301, ₴211 and 2 × ₴100, then the stats show "4 bags rescued" and "₴712 saved so far".
- [x] Given cancelled or missed orders, then they don't count toward the stats.
- [x] Given Pickup area, then Location opens, and after "Show results" the row reflects the new label and radius.
- [x] Given Log out confirmed, then the session is cleared and Welcome shows.
- [x] Given a store user, then the stats and Pickup area are hidden, and Report + Log out are shown.
- [x] Given a name edit to an empty string, then it's rejected inline and by the API (400).

### Approach steps
1. Add the stats + `PATCH /me` routes + integration tests.
2. Add the hooks + keys.
3. Build ProfileScreen (role-aware sections), the edit-name sheet and the logout confirm.

### Testing
- Unit: savings math from minor units.
- Integration: `test/me-stats.test.ts`, `test/me-patch.test.ts`.
- Component: ProfileScreen per role, logout confirm, pickup area label.
- E2E: none.

---

## Status
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — done on `feat/08-15-customer-and-store`. Decisions and deviations:
  - Built in the 08–15 batch.
  - Both roles share `ProfileScreen`; shops see no stats or pickup area.
  - "Report a problem" isn't shown yet (it's brief 16); Notifications isn't rendered (as planned). The Language row is display-only.
  - Log out and the name edit use the new kit `Sheet` (in-app, not a native alert).
