# Feature roadmap

Build in order. A brief is picked up only when everything it depends on is `done`.
Design: [Leftover App Design canvas](https://claude.ai/artifact/9xNrBDdebCvj6AujivZqyQ). Artboard names below are the canvas file names.

| # | Brief | Depends on | Artboards | Maestro |
|---|---|---|---|---|
| 01 | [design-system](01-design-system.md) | — | Main (Foundations), Components | — |
| 02 | [api-foundation](02-api-foundation.md) | — | — | — |
| 03 | [auth](03-auth.md) | 01, 02 | Welcome, Login, Register | — |
| 04 | [shop-setup](04-shop-setup.md) | 03 | — (new screen, built from kit) | — |
| 05 | [location-radius](05-location-radius.md) | 03, 04 (MapPicker) | Location, LocationSearch | — |
| 06 | [discover](06-discover.md) | 05 | Discover, DiscoverLoading, DiscoverEmpty, DiscoverError | — |
| 07 | [store-detail](07-store-detail.md) | 06 | StoreDetail | — |
| 08 | [reserve](08-reserve.md) | 07 | Reserve, ReserveSoldOut | customer-reserve-pickup (part 1) |
| 09 | [pickup](09-pickup.md) | 08, 12 (collected transition) | Pickup, PickupCollected | customer-reserve-pickup (part 2) |
| 10 | [orders](10-orders.md) | 09 | Orders, OrdersPast, OrdersEmpty | — |
| 11 | [store-bags](11-store-bags.md) | 04 | StoreBags, StoreBagsEmpty, AddBag | store-add-bag |
| 12 | [store-orders-code](12-store-orders-code.md) | 08, 11 | StoreOrders, StoreCodeSuccess, StoreCodeError | — |
| 13 | [reviews-ratings](13-reviews-ratings.md) | 09, 10 | Review (+ ratings on StoreDetail, PickupCollected) | — |
| 14 | [favorites](14-favorites.md) | 06, 07 | — (heart on BagCard / StoreDetail) | — |
| 15 | [profile-settings](15-profile-settings.md) | 03, 05, 10 | Settings | — |
| 16 | [report-problem](16-report-problem.md) | 10 | Report, ReportSent | — |
| 17 | [web-support](17-web-support.md) | 01–16 | — (existing screens in a browser) | — |
| 18 | [floating-tab-bar](18-floating-tab-bar.md) | 01, 03 | Components (tab bar; canvas update first) | — |
| 19 | [dark-theme](19-dark-theme.md) | 01, 18 | All (dark token set + dark Components artboard first) | — |
| 20 | [images](20-images.md) | 04, 11 | StoreDetail, Discover, AddBag (real photos instead of tints) | store-add-bag (optional photo) |
| 21 | [oman-localization](21-oman-localization.md) | 01–18 | All (Arabic RTL, OMR) | both flows once in Arabic |

Recommended sequence: 01 → 02 → 03 → 04 → 05 → 18 → 06 → 07 → 08 → 11 → 12 → 09 → 10 → 13 → 14 → 15 → 16 → 17.
(11 and 12 move up so that 09 can show the real "collected" transition. 18 lands before 06, the first real tab screen.)
Next (drafted 2026-09-30, for the Oman showcase): 21 → 20 → 19. Localization first because it's what the client sees; images next for the demo's look; dark theme last (it touches every style file, so it's cheaper once RTL's logical-properties sweep is done). Each brief opens with the decisions to make before it's frozen.

## Cross-cutting decisions
- **Money:** UAH, integer kopiyky (`priceMinor: 14900` = ₴149). Format with `formatMoney` only in UI.
- **Time:** ISO-8601 UTC on the wire and in D1. Stores carry an IANA `timezone` (default `Europe/Kyiv`) for "today" and opening-hour logic. Services take `now` from `src/lib/clock.ts` so tests can freeze it.
- **Stock:** reserve, cancel and quantity edits use `db.batch()` with a guarded `UPDATE`, and zero rows affected means a conflict (see `gotchas.md`).
- **Order status:** stored as `reserved | collected | cancelled`. Derived for display only: `ready` (reserved, now inside the window) and `missed` (reserved, window ended).
- **Geo:** `haversineKm` lives in `@leftover/shared`. Distance always comes from the location selected in the Zustand store.
- **Auth:** PBKDF2 (WebCrypto) password hashes, opaque session tokens stored hashed, `Authorization: Bearer`, and the token kept in `expo-secure-store`.
- **Payment:** pay at the store. The app never handles money.

## Global out of scope (every brief)
Payments · push notifications · password reset / email verification · real food photos (category tint placeholders stay) · languages other than English · admin UI · rate limiting · web target (until [17](17-web-support.md); demos run on the iOS Simulator / Android emulator via Expo Go until then).
