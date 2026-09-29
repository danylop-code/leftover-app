# Feature: store-orders-code

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
At the counter, a shop confirms a customer's code in seconds and knows exactly what to hand over and charge.

### Context
Artboards **StoreOrders** (date, "Today's orders", "Enter pickup code" with 4 boxes, Confirm pickup, "To collect · 2 of 3" list with names, items, window, Reserved/Collected, price), **StoreCodeSuccess** ("Code 4827 — all good", Hand over 1 × Bakery surprise bag to Olena M., Take payment ₴149, Next code), **StoreCodeError** ("No order today matches 4872. Check the code and try again.").

### In scope
- API (`requireRole('store')`): `GET /store/orders/today` (orders for the owner's store whose bag window is today in the store's timezone; customer first name + last initial, items, window, status, total) and `POST /store/orders/confirm` `{ code }`: a guarded `UPDATE orders SET status='collected', collected_at=now WHERE store = mine AND code = :code AND status='reserved' AND window is today` → returns the order summary; no row → 404 `code_not_found`.
- Shared `ConfirmCodeBody` (exactly 4 digits), `StoreOrder` schemas.
- Mobile `src/features/store-orders`: StoreOrdersScreen with a 4-box `CodeInput` (auto-advance, paste, backspace), Confirm, success panel (hand over + take payment + Next code resets), error message under the input, and a "To collect" list refreshed after confirm.

### Out of scope
- QR scanning.
- Confirming a missed order after its window (a shop can't; the customer sees Missed).
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a reserved order today with code 4827, when confirmed, then its status is `collected` with `collected_at` set, and the success panel shows the items, customer and amount to charge.
- [ ] Given the same code confirmed again, then 404 `code_not_found` (no double collection).
- [ ] Given a code belonging to another shop, then 404.
- [ ] Given a non-4-digit input, then Confirm stays disabled and the API rejects with 400.
- [ ] Given a wrong code, then the error message quotes the entered code, and the inputs stay filled for editing.
- [ ] Given a confirm, then the "To collect" count decreases and the order moves to Collected with its time.
- [ ] The customer's Pickup screen (09) switches to Collected on its next poll.

### Approach steps
1. Write the shared schemas.
2. Add the service + routes + integration tests.
3. Build the CodeInput component (feature-local) + component tests.
4. Build the screen + hooks.

### Testing
- Integration: `test/store-orders.test.ts` (today filter in tz, confirm success, double confirm, cross-shop, validation).
- Component: CodeInput (advance, paste, backspace), StoreOrdersScreen success/error states.
- E2E: used inside `customer-reserve-pickup.yaml` via a seeded API call to confirm, keeping the flow count at two.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
