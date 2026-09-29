# Feature: floating-tab-bar

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
The bottom tab bar feels modern: a floating "island" above the content instead of a full-width bar.

### Context
Requested 2026-09-29 after the first simulator demo. It changes the design canvas's `.tabbar` (full-width, 84px, top border). Scheduled after 05 and before 06, because Discover (06) is the first real screen inside the tabs. The kit's `TabBar` (presentational) and `RoleTabs`/`RouterTabBar` (expo-router adapter) are the only places to change; tab screens must leave room for the island.

### In scope
- Update the design canvas first: a new variant of the Components artboard's tab bar, and a floating-island `--tabbar-*` token set in `theme.css` (inset from the edges, radius, elevation, surface/blur), so the theme parity test keeps working.
- `src/shared/ui/TabBar`: an island inset from the screen edges and the home indicator (safe-area aware), pill radius, `elevation[3]`, active tab as a filled pill with icon + label, inactive icon-only or icon + label (decide from the canvas update).
- Content never sits hidden under the island: expose the island's height (e.g. a `useTabBarInset()` hook or tokens) for scroll content padding and for floating toasts/FABs (the StoreBags FAB and undo toast in 11 sit above it).
- Hide the island while the keyboard is open (Android).
- Both role tab sets (customer: Discover / Orders / Profile; store: Bags / Orders / Profile).

### Out of scope
- Animated tab transitions beyond a simple press/selection change.
- Blur on Android if it isn't available in Expo Go (fall back to the solid surface).
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given the theme, when compared with the updated `theme.css`, then the new tab bar tokens match (parity test).
- [ ] Given any tab screen, then the island floats above the content with its inset and radius, clear of the home indicator on iPhones with and without one.
- [ ] Given a scrolled list, then its last item can scroll fully above the island.
- [ ] Given a tab press, then it navigates, and the active tab is exposed as `selected` to screen readers; every tab keeps a ≥ `tapMin` hit area.
- [ ] Given the keyboard is open on Android, then the island is hidden.

### Approach steps
1. Update the canvas (Components tab bar variant + tokens) and port the tokens.
2. Rework `TabBar` + tests (a11y, hit area, inset).
3. Add the content inset helper; use it in the tab layouts and placeholders.
4. Check both roles on the iOS Simulator and Android emulator.

### Testing
- Unit: token parity (existing test, new tokens).
- Component: TabBar selection/a11y/hit area; inset helper with mocked safe-area insets.
- E2E: none.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created: floating "island" tab bar requested after the first demo
