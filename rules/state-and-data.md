# State and data

- [ ] Server state only via TanStack Query hooks in `src/features/<feature>/api/`. No `fetch` or `useEffect`-loading in components or screens.
- [ ] All network calls go through `src/shared/api/client.ts`. Nothing else calls `fetch`.
- [ ] Every response is parsed with a `@leftover/shared` Zod schema before it reaches a hook's consumer. API request bodies are validated with the same schemas.
- [ ] Zustand only for client state: session, selected location, selected radius. Never cache server data in Zustand.
- [ ] Query keys come only from the keys factory in `src/shared/api/keys.ts`; no inline array keys.
- [ ] Mutations invalidate by keys from the factory.
