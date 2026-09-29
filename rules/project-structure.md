# Project structure

## Mobile (`apps/mobile`)
- [ ] `app/` holds Expo Router routes only; each route file just renders a screen from `src/features`.
- [ ] Feature code lives in `src/features/<feature>/`:
  - `components/` — feature-specific UI
  - `hooks/` — feature-specific hooks
  - `api/` — TanStack Query hooks + query functions for this feature
  - `screens/` — screen components rendered by routes
- [ ] Cross-feature code lives in `src/shared/`:
  - `ui/` — reusable primitives (Button, Text, Card…)
  - `theme/` — color, spacing, radius, typography tokens
  - `i18n/` — i18next setup + `locales/en.json`
  - `api/` — `client.ts` (the only network entry point) + query `keys.ts`
  - `store/` — Zustand stores (client state only)
  - `constants/` — non-theme constants (limits, defaults)
- [ ] Features never import from other features; share via `src/shared` or `@leftover/shared`.
- [ ] Tests sit next to the code: `*.test.ts(x)`. E2E flows in `e2e/` (Maestro).

## API (`apps/api`)
- [ ] `src/index.ts` — builds the Hono app and mounts routers; nothing else.
- [ ] `src/routes/<resource>.ts` — one Hono router per resource; validate input with shared Zod schemas, call services, return.
- [ ] `src/services/` — business logic (pricing, stock, geo); no Hono types.
- [ ] `src/db/schema.ts` — all Drizzle tables; migrations generated into `migrations/`.
- [ ] `src/lib/` — env types, db client, errors, small utilities.
- [ ] Integration tests in `test/`, unit tests next to services.

## Shared (`packages/shared`)
- [ ] One file per resource exporting Zod schemas + `z.infer` types; re-exported from `src/index.ts`.
- [ ] No runtime dependencies beyond `zod`; no platform APIs.
