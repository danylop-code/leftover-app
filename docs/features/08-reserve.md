# Feature: reserve

## Plan — FROZEN (changes go in Changelog)

### Goal
A customer reserves one or more bags, never oversells, and gets a pickup code.

### Context
Artboards **Reserve** (bag summary, description, quantity stepper with "3 left", pickup window + address, "Pay at the store — No card needed now", total with "You save ₴301", "Reserve for ₴149") and **ReserveSoldOut** ("Just sold out — nothing was reserved", other bags still available at this shop, "See other bags nearby"). See the stock rule in `gotchas.md`.

### In scope
- API `POST /orders` `{ bagId, qty }` (`requireRole('customer')`), in `src/services/orders.ts`:
  - validates the bag is active, and now < `pickup_end`;
  - `db.batch([guarded UPDATE bags SET qty_available = qty_available - :qty WHERE id = :id AND qty_available >= :qty AND is_active = 1, INSERT order …])` — if the update affects 0 rows, the insert must not persist (a guarded `INSERT … SELECT … WHERE changes() = 1` or equivalent), and the response is 409 `sold_out` with the remaining `qtyAvailable`;
  - snapshots `unit_price_minor` and `unit_original_price_minor`;
  - generates a 4-digit `code` unique among the store's `reserved` orders for that day (retry on collision).
- `MAX_QTY_PER_ORDER` in shared constants (default 5).
- Shared `CreateOrderBody`, `Order` schemas.
- Mobile `src/features/reserve`: ReserveScreen (stepper max = min(qtyAvailable, MAX)), total and saving computed from minor units, `useCreateOrder` → on success navigate to Pickup (09) and invalidate nearby/store/orders keys; on `sold_out` show the ReserveSoldOut state with the store's other available bags.

### Out of scope
- Holding a reservation timer / expiry before pickup.
- Payment.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [x] Given a bag with 3 left, when reserving 1, then 201 with a 4-digit code, and `qty_available` becomes 2.
- [x] Given 1 left and two concurrent reserve requests, then exactly one succeeds and the other gets 409 `sold_out`; `qty_available` is 0, never negative, and exactly one order exists.
- [x] Given qty > available, then 409 `sold_out` with the current available count, and nothing is written.
- [x] Given qty > `MAX_QTY_PER_ORDER` or < 1, then 400.
- [x] Given a paused bag, or a past `pickup_end`, then 409 `not_available`.
- [x] Given a store user, then 403.
- [x] Given 2 × ₴149 (orig ₴450), then the UI shows total ₴298 and "You save ₴602" computed from integer minor units.
- [x] Given a `sold_out` response, then the sold-out state shows, and the stepper/button are disabled.

### Approach steps
1. Write the shared schemas + constants.
2. Write the order service with the guarded batch + code generation, with integration tests first (concurrency test via `Promise.all`).
3. Add the route.
4. Build the screen, hook and sold-out state.

### Testing
- Unit: code generation uniqueness/retry, total/saving math.
- Integration: `test/orders-create.test.ts` covering every API AC, including the concurrent last-bag race.
- Component: ReserveScreen stepper bounds, totals, sold-out state rendering.
- E2E: `customer-reserve-pickup.yaml` — log in (seeded customer) → Discover → bag → Reserve → Pickup shows the code (continued in 09).

---

## Status
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — plan frozen; work started on `feat/08-reserve`. Decisions:
  - Reserve reads the bag from 07's `GET /stores/:id` (already cached when coming from StoreDetail), which gains each bag's `description`; no separate bag endpoint. Route `/reserve/[bagId]?storeId=`, shown as a modal.
  - Code uniqueness: among the store's `reserved` orders created in the last 24 hours (`CODE_WINDOW_HOURS`), so codes free up as days pass; 12 matches codes in the same window.
  - The guarded batch runs on the raw D1 client (`UPDATE … WHERE qty_available >= ?`, then `INSERT … SELECT … WHERE changes() = 1`), so nothing is written when the update misses.
  - Pickup (09) isn't built yet, and by the roadmap 11 and 12 come before it. Until then, a successful reservation lands on a Pickup placeholder route (`/pickup/[orderId]`) that 09 replaces.
  - `not_available` (paused or window over) shows the same "sold out" layout with its own copy.
- 2026-09-29 — done on `feat/08-15-customer-and-store`. Decisions and deviations:
  - Built in one batch with 09–15 (the user asked for batches from 08 on, with a test suite per screen written afterwards).
  - Reserve reads the bag from 07's `GET /stores/:id`, which gained `description`. Route `/reserve/[bagId]?storeId=` (modal).
  - When fewer bags are left than asked (but some are), the quantity drops to what's left with a warning instead of showing the sold-out state.
  - Success opens Pickup (09, built in the same batch).
  - `customer-reserve-pickup.yaml` is written but not run yet (needs a dev build on a simulator).
