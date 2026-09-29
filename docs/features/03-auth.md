# Feature: auth

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A person can create a customer or shop account, log in, stay logged in across restarts, and log out, and each role lands in its own app.

### Context
Artboards **Welcome**, **Register** (role picker: "I'm a customer" / "I run a shop"), **Login**. Auth is minimal custom: PBKDF2 via WebCrypto, opaque session tokens stored hashed.

### In scope
- API `src/routes/auth.ts`: `POST /auth/register` `{ role, firstName, email, password }`, `POST /auth/login`, `POST /auth/logout`, `GET /me`.
- `src/services/auth.ts`: PBKDF2-SHA256 (≥100k iterations, per-user salt), constant-time compare, 32-byte random token (SHA-256 hash stored), 30-day expiry.
- `src/lib/auth.ts` middleware: `requireAuth` (sets `c.var.user`), `requireRole('customer'|'store')`.
- Shared schemas: `RegisterBody` (email normalized to lowercase, password ≥ 8, firstName 1–40), `LoginBody`, `Session`, `Me`.
- Mobile `src/features/auth`: Welcome, Register, Login screens; `useRegister`/`useLogin`/`useLogout`/`useMe`; password show/hide.
- `src/shared/store/session.ts` (Zustand) + `expo-secure-store` persistence; client clears the session on 401.
- Routing: `app/(auth)/*`, `app/(customer)/(tabs)/*`, `app/(store)/(tabs)/*`; `app/index.tsx` redirects by session + role; after register a customer → location (05), a shop → shop setup (04).

### Out of scope
- "Forgot password?" link (hidden).
- Social login, email verification.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a new email, when registering as customer, then 201 with a token and `Me` (role customer), and the app routes to location setup.
- [ ] Given a new email, when registering as shop, then the role is `store` and the app routes to shop setup.
- [ ] Given an existing email (any case), when registering, then 409 `email_taken` and the email field shows the error.
- [ ] Given a wrong password or unknown email, when logging in, then 401 `invalid_credentials` with the same message for both.
- [ ] Given a password < 8 chars, then the form blocks submit with an inline error and the API also rejects with 400.
- [ ] Given a stored valid token, when the app cold-starts, then it opens the role's home without showing Welcome.
- [ ] Given an expired or revoked token, when any request returns 401, then the session is cleared and Welcome is shown.
- [ ] Given logout, then the token is deleted server-side and on the device, and `GET /me` with it returns 401.
- [ ] Given a customer token, when calling a `requireRole('store')` route, then 403 `forbidden`.
- [ ] Password hashes are never returned by any endpoint.

### Approach steps
1. Write the shared auth schemas.
2. Write the service (hash/verify/token) with unit tests.
3. Add the routes + middleware + integration tests.
4. Add the session store + secure-store persistence + the client 401 hook.
5. Build the screens + hooks + route groups + redirects.

### Testing
- Unit: password hash/verify roundtrip + wrong password, token hashing, email normalization.
- Integration: `test/auth.test.ts` covering every AC above against local D1.
- Component: Register (role selection, validation errors, submit disabled while pending), Login (error banner on 401).
- E2E: none (covered implicitly by the two flows' setup).

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
