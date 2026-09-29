# Gotchas

- D1 has no transactions across requests; use `db.batch()` with a guarded `UPDATE` for stock (`... SET qty = qty - 1 WHERE id = ? AND qty > 0`) and check rows affected.
- Distances must be computed from the currently selected location, never a cached one.
- Money is integer minor units; format only at the UI edge.
- Expo SDK moves fast: check the versioned docs (https://docs.expo.dev/llms.txt) instead of memory; add native deps with `npx expo install`.
- pnpm uses `nodeLinker: hoisted` for Expo/Metro; don't switch to isolated without testing Metro.
- `compatibility_date` in `apps/api/wrangler.jsonc` must be ≤ the workerd bundled with `@cloudflare/vitest-pool-workers`, or tests fail with `ERR_RUNTIME_FAILURE`. After changing wrangler config, run `pnpm --filter @leftover/api types`.
- Mobile tests are pinned to Jest 29 because `jest-expo` 57 targets it, and to RNTL 13 because RNTL 14 needs React ≥19.3. Bump them together with the Expo SDK.
