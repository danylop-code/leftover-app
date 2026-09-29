# Feature: dark-theme

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
The app looks right in dark mode: it follows the phone's setting by default, and a person can choose Light, Dark or System in Profile.

### Context
Requested 2026-09-30. Today every color comes from one light palette (`src/shared/theme/colors.ts`), read at module load by ~90 `StyleSheet.create` calls, so colors can't change at runtime. The design canvas has only the light `:root` tokens.

Affects every screen, the kit, the maps (04/05/17), the status bar, and the web build (17: `prefers-color-scheme`).

**Decide first:**
- **Dark palette source:** design it on the canvas first (a `[data-theme="dark"]` token block in `theme.css` plus a dark Components artboard), then port it, the way 01 and 18 did. *Recommended.* Publishing to the canvas needs the user's approval (18's publish was blocked by a permission check).
- **Map in dark mode:** keep the light map tiles (simplest), or use dark map styles (Apple/Google map styling on native, a dark tile set on web). *Recommended: light maps for now*, with the radius circle and pin re-tinted for contrast.

### In scope
- Canvas: dark token set (`--color-*`, `--map-*`, `--media-*`, elevation tuned for dark surfaces) and a dark Components artboard; the parity test covers both sets.
- Theme: `color`, `map`, `media`, `elevation` become per-scheme (`light` and `dark` objects with identical keys, enforced by types).
- A `ThemeProvider` + `useTheme()` and a `makeStyles((theme) => …)` helper that memoizes per scheme; every `styles.ts` moves to it (mechanical; the no-literals lint rule still applies).
- Preference in Profile → Appearance: System / Light / Dark, stored on the device (Zustand + AsyncStorage). System follows `useColorScheme()` live.
- Status bar, navigation backgrounds, splash-to-first-frame without a white flash, and `userInterfaceStyle: "automatic"` in `app.json`.
- Web: the same preference; System follows `prefers-color-scheme`.

### Out of scope
- Per-screen or scheduled themes, high-contrast mode.
- Dark map tiles (unless chosen above).
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [x] Given the phone in dark mode and the preference on System, when the app opens, then every screen uses the dark palette with no light flash first.
- [x] Given Dark or Light chosen in Profile, then it wins over the phone setting and survives a restart.
- [x] Given the phone switches mode while the app is open (System), then the app follows without a restart.
- [x] Given the dark theme, then body text and controls meet WCAG AA contrast (4.5:1 text, 3:1 large text and UI) — checked in a unit test over token pairs.
- [x] The parity test checks both the light and the dark token sets against `theme.css`.
- [x] No style file reads colors at module load (lint or test guard).

### Approach steps
1. Canvas: dark tokens + dark Components artboard (with the user's approval to publish); port and extend the parity test.
2. Theme provider, `useTheme`, `makeStyles`; the preference store.
3. Migrate the kit, then features, screen by screen (mechanical, reviewable in chunks).
4. Status bar, splash, maps, web; Profile Appearance row.

### Testing
- Unit: token parity (both sets), contrast pairs, preference store.
- Component: kit components render with both themes; Profile appearance switch.
- E2E: none.

---

## Status
done (canvas update pending approval)

## Last updated
2026-09-30

## Changelog
- 2026-09-30 — drafted
- 2026-09-30 — decisions (recommended options): light map tiles in both schemes (`userInterfaceStyle="light"` on the native map); dark palette designed in code first, proposed for the canvas as `:root[data-theme="dark"]` in `fixtures/design-dark.ts`, which the parity test checks. Publishing it to the canvas still needs the user's OK.
- 2026-09-30 — changed: `ThemeProvider` wasn't needed. `useTheme()` reads the preference (Zustand) and `useColorScheme()` directly, and `makeStyles` (built in 21) caches one style set per scheme × language. The migration of every `styles.ts` happened in 21.
- 2026-09-30 — added: Profile → Appearance (System / Light / Dark, a `ChoiceList` sheet), stored with the language in the preferences store; status bar, root and navigator backgrounds follow the scheme; `userInterfaceStyle: automatic` and a dark splash background in `app.json`; web sets `color-scheme`.
- 2026-09-30 — tests: dark token parity and key parity, WCAG AA pairs (`contrast.test.ts`), a guard that no file imports themed tokens statically or calls `StyleSheet.create` in a `styles.ts`, System/Light/Dark behaviour and persistence, kit components in both schemes, the Profile switch.
