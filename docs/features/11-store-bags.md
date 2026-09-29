# Feature: store-bags

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A shop lists today's surplus bags in about a minute and keeps them up to date: pause, edit, delete.

### Context
Artboards **StoreBags** (shop name, "My bags", stats "2 bags live now" / "5 reserved today", BagRows with old/new price, "3 of 5 left", Paused, Sold out, row menu, Add bag, "Sandwich bag paused · Undo" toast, store tab bar Bags / Orders / Profile), **StoreBagsEmpty** ("No bags yet … goes live as soon as you save", Add a bag), **AddBag** (Title, Description 0/200, Category chips incl. Other, Original price, Sale price, live discount "−67%", "Shown as ₴450 ₴149", Bags today stepper with "3 already reserved", Pickup window From/Until with "At least 30 minutes" help, "Show to customers" switch, Save changes, Delete bag).

### In scope
- API `src/routes/store-bags.ts` (`requireRole('store')`, scoped to the owner's store): `GET /store/bags` (+ stats), `POST /store/bags`, `PATCH /store/bags/:id`, `DELETE /store/bags/:id`.
- Shared `BagBody`: title 3–60, description ≤ 200, category enum, `originalPriceMinor` > `priceMinor` > 0 (ints), `qtyTotal` 1–50, `pickupStart`/`pickupEnd` ISO for today in the store's timezone, end − start ≥ 30 min, end > now, `isActive`.
- Qty edits: `qty_available += newTotal − oldTotal` with a guard that `newTotal ≥ reservedCount` (409 `below_reserved` otherwise).
- Delete: 409 `has_reservations` when reserved orders exist (the UI suggests pausing instead); otherwise hard delete.
- Mobile `src/features/store-bags`: StoreBagsScreen (stats, rows, empty state), BagFormScreen (add + edit), pause/resume from the row menu with an undo toast (optimistic, rolled back on error), price inputs entered in hryvnias and converted to minor units at the input edge.
- Store tab layout: Bags / Orders / Profile.

### Out of scope
- Recurring/scheduled bags for future days.
- Photos.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a valid form, when saving a new bag, then it appears in My bags as live and is returned by `/bags/nearby` for a nearby customer.
- [ ] Given sale price ≥ original price, then an inline error shows and the API returns 400.
- [ ] Given a window < 30 min or ending in the past, then an inline error shows and the API returns 400.
- [ ] Given 3 reserved of 5, when reducing Bags today to 2, then 409 `below_reserved`, and the stepper min is 3 in the UI.
- [ ] Given 5 → 6 total with 2 available, then available becomes 3.
- [ ] Given pause, then the row shows Paused, the bag disappears from Discover, and Undo within the toast restores it.
- [ ] Given delete with reserved orders, then 409 and a message suggesting pause; without reservations, the bag is removed.
- [ ] Given another shop's bag id, then 404.
- [ ] Stats: "live now" counts active bags with stock and a future `pickup_end`; "reserved today" sums qty of today's non-cancelled orders.

### Approach steps
1. Write the shared `BagBody` + validation tests.
2. Add the service + routes + integration tests (ownership, qty guard, delete guard).
3. Add hooks (list, create, update with optimistic pause, delete) + keys.
4. Build the list, empty state, form, toast.
5. Write the Maestro flow.

### Testing
- Unit: `BagBody` refinements (price order, window length, today in tz), hryvnia→minor conversion.
- Integration: `test/store-bags.test.ts` covering every API AC.
- Component: BagFormScreen validation + discount preview; StoreBagsScreen stats, paused/sold-out rows, undo toast.
- E2E: `store-add-bag.yaml` — log in (seeded shop) → Add bag → fill form → Save → the bag is listed as live.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
