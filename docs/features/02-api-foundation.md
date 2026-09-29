# Feature: api-foundation

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
The Worker and the app talk through one typed, validated contract, backed by a migrated D1 schema and seed data.

### Context
No artboards. This is groundwork for every flow. Data model and conventions: [README cross-cutting decisions](README.md#cross-cutting-decisions).

### In scope
- `apps/api/src/db/schema.ts`: `users`, `sessions`, `stores` (incl. `timezone`, `lat`, `lng`, `opens_at`, `closes_at` as `HH:mm`), `bags`, `orders` (incl. `unit_price_minor` and `unit_original_price_minor` snapshots, `code`), indexes on `stores(lat,lng)`, `bags(store_id, pickup_end)`, `orders(user_id)`, `orders(bag_id)`. First migration via drizzle-kit.
- Error envelope `{ error: { code, message, fields? } }` as a shared `ApiError` schema; Hono `onError`/`notFound` map Zod → 400, known domain errors → 4xx, everything else → 500 without leaking internals.
- Request validation helper using shared Zod schemas (`src/lib/validate.ts`).
- `src/lib/clock.ts` (injectable `now()`), `src/lib/ids.ts` (`crypto.randomUUID`).
- `GET /health`.
- `packages/shared`: resource schemas `User`, `Store`, `Bag`, `Order` (+ request bodies added by owning features), `haversineKm`.
- Mobile: `src/shared/api/client.ts` (`EXPO_PUBLIC_API_URL`, bearer from the session store, JSON, parse with a passed Zod schema, throws a typed `ApiError` / `NetworkError`), `keys.ts` factory, QueryClientProvider in the root layout (retry off for 4xx).
- Dev seed: `apps/api/seed/dev.sql` + `db:seed:local` script (a handful of Lviv shops and bags, prices in kopiyky).

### Out of scope
- Auth middleware (03).
- Feature routes.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a fresh local D1, when `db:migrate:local` then `db:seed:local` run, then both succeed and the seed stores are queryable.
- [ ] Given `GET /health`, then 200 `{ ok: true }`.
- [ ] Given an unknown route, then 404 with the error envelope `code: "not_found"`.
- [ ] Given a body that fails a Zod schema, then 400 with `code: "validation"` and per-field messages.
- [ ] Given a thrown unexpected error, then 500 `code: "internal"` with no stack in the body.
- [ ] Given a response that doesn't match the schema passed to `client.ts`, then the call rejects with a typed parse error (never returns unparsed data).
- [ ] `haversineKm` is accurate to ±0.5% against known city pairs.

### Approach steps
1. Write the shared schemas + `haversineKm` (+ tests).
2. Write the Drizzle schema, generate the migration, wire migrations into the vitest pool (already configured).
3. Add the error types + `onError`/`notFound` + validate helper + `/health`.
4. Write the seed SQL + script.
5. Write the mobile client, keys factory and provider.

### Testing
- Unit: `haversine.test.ts`, shared schema tests (money must be an int ≥ 0, ISO datetimes).
- Integration: `test/health.test.ts`, `test/errors.test.ts` (404, 400, 500 via a test-only route).
- Component/unit (mobile): `client.test.ts` with mocked `fetch` — bearer header, parse success, parse failure, network failure.
- E2E: none.

---

## Status
in-progress

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — plan frozen; work started on `feat/02-api-foundation`
