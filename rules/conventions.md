# Conventions

## Naming
- [ ] Components: PascalCase, file named after the component (`BagCard.tsx`).
- [ ] Hooks: `useX`, file `use-x.ts`.
- [ ] All other files: kebab-case (`price-format.ts`). Expo Router files follow router naming (`_layout.tsx`, `[id].tsx`).
- [ ] Zod schemas PascalCase (`Bag`), inferred types share the name.

## No literals in components
- [ ] No magic numbers: spacing/sizes/radii from `src/shared/theme`, limits/defaults from `src/shared/constants`.
- [ ] No color literals (`#fff`, `rgb()`, `'red'`): theme tokens only.
- [ ] No user-facing copy in components: i18next keys, strings in `src/shared/i18n/locales/en.json` and `ar.json` (the parity test fails on a missing key).
- [ ] A component file contains the component only. Styles go in a co-located `styles.ts`; mocks go in tests/fixtures; constants go in `src/shared/constants`.
- [ ] `styles.ts` exports `useStyles = makeStyles((theme) => …)`: colors, fonts and typography come from the theme argument (they change with language and, from 19, color scheme), and styles are made with `theme.sheet(...)`. Static tokens (space, radius…) stay imports.
- [ ] Layout is direction-neutral: `start`/`end`, `marginStart`, `paddingEnd`, `borderTopStartRadius` — never `left`/`right` (hit-slop insets excepted).

## Data types
- [ ] Money is integer minor units (`priceMinor: 499`), never floats. Format only at the UI edge.
- [ ] Dates are ISO-8601 UTC strings on the wire and in D1; convert to local time only for display.
