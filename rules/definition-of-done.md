# Definition of Done

A feature is done only when every box is checked:

- [ ] Every acceptance criterion in the brief has a test, and it passes.
- [ ] Structure matches `rules/project-structure.md`.
- [ ] No magic numbers, color literals or inline copy; styles only in co-located `styles.ts` (`rules/conventions.md`).
- [ ] Money in integer minor units; dates ISO UTC.
- [ ] Server data via Query hooks + `client.ts` + shared Zod parsing; keys from the factory (`rules/state-and-data.md`).
- [ ] New strings added to `en.json`.
- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] Feature brief: Status, Last updated and Changelog updated.
- [ ] New traps added to `gotchas.md`.
- [ ] No changes outside the brief's In scope.
