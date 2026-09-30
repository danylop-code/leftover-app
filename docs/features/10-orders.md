# Feature: orders

## Plan — FROZEN (changes go in Changelog)

### Goal
A customer finds every current and past reservation in one place.

### Context
Artboards **Orders** (segmented Current with count / Past; OrderCards with store, bag × qty, status badge Ready now / Reserved, window, distance, "Pay at the store", price, Show code / View), **OrdersPast** (Collected, Cancelled with "You cancelled at 16:40", Missed with "Pickup window ended", Leave a review / You rated), **OrdersEmpty** ("No bags reserved yet", Find food nearby).

### In scope
- API `GET /orders/me?scope=current|past` (`requireRole('customer')`): current = `reserved` and not missed (sorted by `pickup_start`); past = collected, cancelled or missed (newest first, last 60 days). Includes store summary, and the `reviewed` flag once 13 exists.
- Mobile `src/features/orders`: OrdersScreen with a Segmented control, `useMyOrders(scope)`, OrderCard actions: Show code / View → Pickup (09); Leave a review → Review (13, hidden until done).
- The current-count badge on the segment.
- Empty states per segment.

### Out of scope
- Pagination (60-day window cap instead).
- Re-order.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [x] Given a reserved order inside its window, then it's under Current with a "Ready now" badge and "Show code".
- [x] Given a reserved order whose window ended, then it's under Past as "Missed · Pickup window ended".
- [x] Given a cancelled order, then it's under Past with "You cancelled at HH:mm" in the store's timezone.
- [x] Given no orders, then the Current empty state shows "Find food nearby" → Discover.
- [x] Given another customer's orders, then they never appear.
- [x] The Current badge count equals the number of current orders.

### Approach steps
1. Add the route + service (reusing `deriveOrderStatus`) + integration tests.
2. Add the hook + keys.
3. Build the screen, segment and empty states.

### Testing
- Integration: `test/orders-me.test.ts` (scope split, missed derivation with a frozen clock, isolation between users).
- Component: OrdersScreen segments, badges per status, empty state.
- E2E: none.

---

## Status
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-29 — done on `feat/08-15-customer-and-store`. Decisions and deviations:
  - Built in the 08–15 batch.
  - Past orders use the kit's `OrderCard` too (the artboard's past card is more compact: title first, "store · date" underneath). Leave a review is a ghost button without the star glyph (the icon set has none).
  - Current "Show code" is primary for ready orders, "View" (secondary) for later ones, as on the artboard.
