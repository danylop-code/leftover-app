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
- [x] Given a new email, when registering as customer, then 201 with a token and `Me` (role customer), and the app routes to location setup.
- [x] Given a new email, when registering as shop, then the role is `store` and the app routes to shop setup.
- [x] Given an existing email (any case), when registering, then 409 `email_taken` and the email field shows the error.
- [x] Given a wrong password or unknown email, when logging in, then 401 `invalid_credentials` with the same message for both.
- [x] Given a password < 8 chars, then the form blocks submit with an inline error and the API also rejects with 400.
- [x] Given a stored valid token, when the app cold-starts, then it opens the role's home without showing Welcome.
- [x] Given an expired or revoked token, when any request returns 401, then the session is cleared and Welcome is shown.
- [x] Given logout, then the token is deleted server-side and on the device, and `GET /me` with it returns 401.
- [x] Given a customer token, when calling a `requireRole('store')` route, then 403 `forbidden`.
- [x] Password hashes are never returned by any endpoint.

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
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — plan frozen; work started on `feat/03-auth`
- 2026-09-29 — done. Decisions and deviations:
  - PBKDF2-SHA256 at exactly 100,000 iterations: the brief's minimum and the deployed Workers maximum. Stored as `pbkdf2-sha256$<iter>$<salt>$<hash>` (base64url). Unknown-email logins verify against a dummy hash so both failures take the same time.
  - Routing hub + guards instead of `Stack.Protected`: `app/index` (`SessionRedirect`) decides where each session goes, and `RoleGate` wraps the `(auth)`, `(customer)` and `(store)` layouts. Screens never navigate after login/register/logout; the session change does it.
  - "After register → location/shop setup" uses a non-persisted `justRegistered` session flag. 04 and 05 replace it with real gating (no shop → setup; no location → Location), so a restart mid-onboarding lands on the role's home until then.
  - Store tab routes are `bags`, `store-orders`, `store-profile`: groups don't appear in URLs, so they can't reuse the customer's `orders`/`profile`. Labels are unchanged.
  - Until 04/05/06/10/11/12/15 land, their routes render `SignedInPlaceholderScreen` (who is signed in + Log out), which is also where logout is reachable.
  - The session (token + user) is persisted as one expo-secure-store entry so a cold start routes before any network call; `/me` then refreshes it, and a 401 there signs out.
  - Logout clears the device session and query cache even if the API call fails.
  - Seed users get real demo logins (password `leftover24`).
  - Kit tweaks: Banner is a single accessible element (announced as an alert), CategoryMedia accepts `style`, `RouterTabBar`/`RoleTabs` adapt expo-router tabs to the design's TabBar.
