# Feature: pickup

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
A customer with a reservation knows exactly when and where to collect, can show their code, can cancel, and sees confirmation once the shop hands the bag over.

### Context
Artboards **Pickup** (Reserved badge, order number, "Show this code at the counter" ticket with the 4-digit code, items + "pay ₴149 in store", store row + Directions, "Pickup opens in 1 h 24 min", window, Cancel reservation with a note) and **PickupCollected** ("Enjoy your haul!", collected time, "You saved ₴301", collected order summary, quick star rating, Leave a review, Back to Discover). Collection itself happens in 12.

### In scope
- API `GET /orders/:id` (owner only) and `POST /orders/:id/cancel` (owner, status `reserved`, now < `pickup_end`): `db.batch` of a guarded status update (`WHERE status = 'reserved'`) + restock (`qty_available = qty_available + qty`), with restock applied only if the status update changed a row.
- Shared `OrderDetail` (incl. derived `displayStatus`: `reserved | ready | missed | collected | cancelled`) + a pure `deriveOrderStatus(order, now)` in `@leftover/shared`.
- Mobile `src/features/pickup`: PickupScreen with a countdown (`useCountdown`, ticks every minute; "Ready now" inside the window; "Pickup window ended" after), Directions, a Cancel confirm sheet (in-app, not a native alert), `useOrder(id)` polling every 15 s while `reserved` so the collected state appears when the shop confirms.
- CollectedScreen: summary, saving, stars → Review (13) prefilled; if 13 isn't done, the stars + review button are hidden.
- Human order number `LF-#####` derived from the id/sequence (display only).

### Out of scope
- Real-time push/websocket (polling is enough).
- Partial cancellation of a multi-bag order.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a reserved order before its window, then the countdown shows "Pickup opens in X h Y min"; inside the window it shows "Ready now"; after, "Pickup window ended" (missed) and Cancel is hidden.
- [ ] Given cancel on a reserved order, then its status is `cancelled` and the bag's `qty_available` increases by the order's qty exactly once, even if cancel is sent twice.
- [ ] Given cancel on a collected, cancelled or ended order, then 409 and stock is unchanged.
- [ ] Given another user's order id, then 404 (no existence leak).
- [ ] Given the shop confirms the code (12), then within one poll interval the screen switches to Collected, with the right saving.
- [ ] `deriveOrderStatus` is pure and covers every boundary (exactly at start/end).

### Approach steps
1. Write `deriveOrderStatus` + tests.
2. Add the order detail + cancel routes with integration tests (double-cancel restock).
3. Add the hooks (`useOrder` with a conditional `refetchInterval`, `useCancelOrder` invalidating orders/nearby/store keys).
4. Build the Pickup + Collected screens + countdown hook.

### Testing
- Unit: `deriveOrderStatus`, `useCountdown` formatting.
- Integration: `test/orders-cancel.test.ts`, `test/order-detail.test.ts`.
- Component: PickupScreen states (before/ready/missed), cancel flow, Collected rendering.
- E2E: `customer-reserve-pickup.yaml` continues — Pickup shows the code → (store confirms via seeded API call/second app step) → Collected visible.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
