# Leftover

Food-rescue marketplace: stores list surplus "bags" at a discount; nearby customers reserve and pick them up.

## Repo map
- `apps/mobile` — Expo + Expo Router app (customer + store)
- `apps/api` — Cloudflare Worker: Hono + Drizzle + D1
- `packages/shared` — Zod schemas + inferred types (single source of truth for API contracts)
- `docs/features/` — roadmap (`README.md`) + one brief per feature (copy `_template.md`)
- Design: [Leftover App Design canvas](https://claude.ai/artifact/9xNrBDdebCvj6AujivZqyQ) — tokens in its `theme.css`
- `rules/` — binding rules; `gotchas.md` — known traps

## Commands
`pnpm lint` · `pnpm format` · `pnpm typecheck` · `pnpm test` · `pnpm test:api` · `pnpm test:mobile` · `pnpm dev:api` · `pnpm dev:mobile`

## Workflow (every feature)
1. Brief: copy `docs/features/_template.md` → `docs/features/<feature>.md`; fill Plan; mark FROZEN when starting.
2. Tests red: write tests from the acceptance criteria; confirm they fail.
3. Implement until green.
4. Walk `rules/definition-of-done.md`.
5. Update the brief's Status, Last updated and Changelog.

## Rules (read before coding)
- [rules/project-structure.md](rules/project-structure.md)
- [rules/conventions.md](rules/conventions.md)
- [rules/state-and-data.md](rules/state-and-data.md)
- [rules/testing.md](rules/testing.md)
- [rules/definition-of-done.md](rules/definition-of-done.md)
- [gotchas.md](gotchas.md) — read before touching stock, geo or money; append new traps.
