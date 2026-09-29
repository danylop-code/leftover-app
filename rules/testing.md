# Testing

- [ ] Tests are written with the feature (red first, per the workflow in CLAUDE.md), not after.
- [ ] Unit tests (Vitest) for pure logic: geo/distance, pricing, validation schemas.
- [ ] Integration tests (Vitest + `@cloudflare/vitest-pool-workers`) for every API route, against local D1 with migrations applied. Cover happy path + each validation/authorization failure.
- [ ] Component tests (Jest + `@testing-library/react-native`) for every screen with logic (conditional rendering, form validation, derived values). Query by role/text, not testID, where possible.
- [ ] Maestro (`apps/mobile/e2e/`) for exactly two flows:
  - `customer-reserve-pickup.yaml` — customer reserves a bag → picks it up
  - `store-add-bag.yaml` — store adds a bag
- [ ] No network in unit/component tests; mock at `src/shared/api/client.ts`.
- [ ] `pnpm test` is green before any commit.
