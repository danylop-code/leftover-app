# Feature: reviews-ratings

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
After collecting a bag, a customer rates it, and those ratings help others choose shops.

### Context
Artboard **Review** (store + bag, "How was it overall?" 5 stars with a word label e.g. "Really good", optional "Rate the details" Quality / Variety / Freshness / Ease of pickup, "Anything to add?" 0/500, Submit review). Also fills the ratings on **StoreDetail** (4.7 · 128 ratings, per-aspect bars, recent reviews with initials + relative time), **PickupCollected** (quick stars), **OrdersPast** (Leave a review / You rated), and the rating on BagCard.

### In scope
- Migration: `reviews(order_id PK, store_id, user_id, overall 1–5, quality?, variety?, freshness?, ease?, text ≤ 500, created_at)`.
- API `POST /orders/:id/review` (owner, order `collected`, one per order → 409 `already_reviewed`); `GET /stores/:id/reviews?limit=3`; aggregates (avg overall 1 decimal, count, avg per aspect) added to `/stores/:id` and a store `rating` added to `/bags/nearby` items.
- Shared `ReviewBody`, `StoreRating`, `ReviewSummary` schemas; the rating word labels in `en.json`.
- Mobile `src/features/reviews`: ReviewScreen (prefilled overall when opened from Collected), `useSubmitReview` invalidating the order, orders and store keys; enable the previously hidden rating UI in 07/09/10 and on BagCard.
- Reviewer display name = first name + last initial if present, else first name.

### Out of scope
- Editing/deleting reviews, shop replies, moderation.
- "See all" reviews list beyond the latest 3.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [ ] Given a collected order, when submitting overall 4, then 201, and the order shows "You rated" in Past.
- [ ] Given a reserved/cancelled/missed order, then 409 `not_collected`.
- [ ] Given a second review for the same order, then 409 `already_reviewed`.
- [ ] Given a text of 501 chars, then the counter turns to the error state, Submit is disabled, and the API returns 400.
- [ ] Given ratings 5, 4, 5, then the store shows 4.7 and "3 ratings"; aspects without answers are excluded from their own average.
- [ ] Given a store with no reviews, then no rating shows anywhere (07, 06).
- [ ] Given stars tapped on Collected, then the Review screen opens with that overall preselected.

### Approach steps
1. Write the migration + shared schemas.
2. Add the service (create, aggregates) + routes + integration tests.
3. Extend the store detail/nearby responses with ratings (update their tests).
4. Build the Review screen + hook; switch on the rating UI in the earlier screens.

### Testing
- Unit: aggregate rounding, display-name formatting.
- Integration: `test/reviews.test.ts` covering every API AC + aggregates on `/stores/:id`.
- Component: ReviewScreen (required overall, optional aspects, counter, submit), StoreDetail ratings section.
- E2E: none.

---

## Status
planned

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
