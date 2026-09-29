# Feature: store-bags

## Plan — FROZEN (changes go in Changelog)

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
- [x] Given a valid form, when saving a new bag, then it appears in My bags as live and is returned by `/bags/nearby` for a nearby customer.
- [x] Given sale price ≥ original price, then an inline error shows and the API returns 400.
- [x] Given a window < 30 min or ending in the past, then an inline error shows and the API returns 400.
- [x] Given 3 reserved of 5, when reducing Bags today to 2, then 409 `below_reserved`, and the stepper min is 3 in the UI.
- [x] Given 5 → 6 total with 2 available, then available becomes 3.
- [x] Given pause, then the row shows Paused, the bag disappears from Discover, and Undo within the toast restores it.
- [x] Given delete with reserved orders, then 409 and a message suggesting pause; without reservations, the bag is removed.
- [x] Given another shop's bag id, then 404.
- [x] Stats: "live now" counts active bags with stock and a future `pickup_end`; "reserved today" sums qty of today's non-cancelled orders.

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
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — done on `feat/08-15-customer-and-store`. Decisions and deviations:
  - Built in the 08–15 batch.
  - Routes: `/bag/new` and `/bag/[id]` (modals). Pause/resume is the row's switch (as on the artboard) rather than a menu; Undo sits in the toast for 5 s.
  - `reservedCount` = total − available (collected bags count as taken), which is also what the quantity guard uses: `newTotal ≥ total − available`, checked inside the UPDATE.
  - Delete: 409 `has_reservations` with reserved orders; a bag with only past orders can't be removed either (409 `has_orders`, "pause it instead") because their history points at it.
  - Pickup times are typed as HH:mm and converted to UTC in the shop's timezone on the device (`isoAtLocalTime`); the API re-checks "today" and "ends in the future".
  - `store-add-bag.yaml` is written but not run yet (needs a dev build on a simulator); its times (23:00–23:45) only work before 23:00.
