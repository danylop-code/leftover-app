# Feature: design-system

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
Every later screen is assembled from themed, tested primitives. No screen needs a literal color, size or string.

### Context
Canvas artboards **Main** (Foundations) and **Components**, plus the design's `theme.css`. Token names map 1:1 (`--color-primary` → `color.primary`, `--space-4` → `space[4]`, `--radius-xl` → `radius.xl`, `--elevation-1` → `elevation[1]`). Fonts: Fraunces (display/title) and Figtree (everything else).

### In scope
- `src/shared/theme`: color, media (category tints + ink), map, typography (display/title/heading/body/label/caption), space, radius, elevation (RN shadow + Android elevation), `tapMin`.
- Fonts via `expo-font` + `@expo-google-fonts/fraunces` / `@expo-google-fonts/figtree`; splash held until fonts load.
- `src/shared/i18n`: i18next + react-i18next init, `en.json`, typed `t` keys.
- `src/shared/lib/format.ts`: `formatMoney(minor)` → `₴149`, `formatDiscount(orig, sale)` → `−67%`, `formatWindow(startIso, endIso, tz)` → `Today · 18:00–19:30`, `formatDistance(km)`.
- `src/shared/ui/icons`: the design's stroke icons via `react-native-svg`.
- `src/shared/ui` kit: Screen, Header, TabBar, Button (primary/secondary/ghost, sm, block, loading, disabled), IconButton, Chip + ChipRow, Badge (stock, low, ready, reserved, collected, cancelled, missed, discount), Field + Input (label, help, error, counter), Textarea, Stepper, Switch, Slider, Segmented, Stars (display + input), RatingBar, Price, EmptyState, Toast, Banner, Skeleton, ListRow, CategoryMedia, StoreLogo, BagCard, BagRow, StoreRow, OrderCard, Ticket.
- Category enum shared with the api: `bakery | meals | groceries | cafe | produce | other`.

### Out of scope
- Dark mode (the design is light only).
- Storybook or a kit gallery screen.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [x] Given the theme module, when compared with the design's `theme.css` `:root`, then every token exists with an identical value.
- [x] Given `formatMoney(14900)`, then it returns `₴149`; given `formatMoney(348000)`, then `₴3,480`; floats are rejected in dev.
- [x] Given a pickup window today in the store's timezone, when formatted, then it reads `Today · 18:00–19:30`; tomorrow reads `Tomorrow · …`; later dates read `Sat, 26 Sep · …`.
- [x] Given a Stepper with min 1 and max 3, when pressing + at 3 or − at 1, then the value doesn't change and that button is disabled.
- [x] Given Stars in input mode, when a star is pressed, then onChange gets 1–5 and each star has an accessible label.
- [x] No component file contains a color literal, a raw number outside `styles.ts`, or user-facing copy (`pnpm lint` plus review).
- [x] Every interactive primitive has a hit area ≥ `tapMin` (48) and an accessibilityRole.

### Approach steps
1. Port `theme.css` to `src/shared/theme/{colors,typography,spacing,radius,elevation,index}.ts`.
2. Add fonts and load them in `app/_layout.tsx` with the splash screen held until ready.
3. Set up i18n (`src/shared/i18n/index.ts`, `locales/en.json`) and import it in the root layout.
4. Write the format helpers plus the shared `Category` enum in `packages/shared/src/category.ts`.
5. Build the primitives (Button → Field → Chip/Badge → Stepper/Switch/Slider/Segmented → Stars → Toast/Banner/Skeleton/EmptyState), each `Name.tsx` + `styles.ts`.
6. Build the composites (BagCard, BagRow, StoreRow, OrderCard, Ticket, TabBar, Header).

### Testing
- Unit: `format.test.ts` (money, discount, window across tz/day boundaries, distance), a theme token parity test against a fixture copy of the `:root` block.
- Component: Button (disabled/loading), Stepper bounds, Stars input, Field error/counter, Price strike-through.
- E2E: none.

---

## Status
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — plan frozen; work started on `feat/01-design-system`
- 2026-09-29 — done. Decisions and deviations:
  - Colors the design's component CSS uses outside `:root` (switch track, role/code tint, toast icons, welcome hero shape, media highlight, store logo palette) are named theme tokens, so no component carries a literal.
  - Category → tint: `meals` → `meal`, `groceries` → `grocery`. `other` has no design tint and uses surface-sunken / text-secondary. Grocery and other glyphs are new, drawn in the design's stroke style.
  - Fraunces' SOFT axis isn't in the static `@expo-google-fonts` files; display text renders at default softness.
  - Native elevation is derived from the largest CSS shadow layer (iOS) plus an Android `elevation` level; the CSS strings stay in `shadows` for parity.
  - The no-literals criterion is enforced by Biome GritQL plugins in `tools/biome/` (color literals, raw numbers in JSX props, inline JSX copy, inline style objects), scoped to mobile component code.
  - Theme parity fixture is a TS module (`fixtures/design-root.ts`) because mobile tests have no Node types.
  - Kit extras beyond the list: `Text`, `ListGroup`, `HeaderLarge`, `stockTone` (low at ≤ 2, per the Components artboard).
