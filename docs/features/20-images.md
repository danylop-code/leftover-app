# Feature: images

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
Shops show real photos: a logo and a cover for the shop, and a photo per bag, uploaded from the phone and shown to customers everywhere the tinted placeholders are today.

### Context
Requested 2026-09-30 for the showcase. Today every image is a placeholder: category tints with a glyph (`CategoryMedia`) and an initial-letter logo (`StoreLogo`); "real food photos" was in the global out-of-scope list (README), which this brief lifts. Shops upload in shop setup (04) and on the bag form (11); customers see photos on Discover (06), StoreDetail (07), Reserve (08), Pickup (09), Orders (10) and Saved (14).

**Decide first:**
- **Storage:** Cloudflare **R2** (*recommended*: it binds to the Worker we already run, has no egress fees, and works locally in `wrangler dev` and in the Vitest pool) or AWS **S3** (needs AWS credentials, signing, and a second provider). The rest of this brief assumes R2.
- **Upload path:** through the Worker (`POST` multipart → the Worker streams to R2; *recommended*: one auth check, size/type validation in one place, simple on web) or direct to R2 with presigned URLs (less Worker traffic; needs R2 S3 API keys and an extra round trip). Fine to start through the Worker and switch if volume grows.
- **Serving:** a Worker route `GET /images/:key` with long cache headers (*recommended* for now), or a public R2 bucket on a custom domain later.

### In scope
- R2 bucket binding (`IMAGES`) in `wrangler.jsonc`; local and test buckets.
- Migration: `stores.logo_key`, `stores.cover_key`, `bags.photo_key` (nullable).
- API (`requireRole('store')`, own shop/bags only): `PUT /store/logo`, `PUT /store/cover`, `PUT /store/bags/:id/photo` (multipart, JPEG/PNG/WebP, ≤ 5 MB, server-checked type by magic bytes), `DELETE` for each; replacing deletes the old object. `GET /images/:key` (public, immutable keys, `Cache-Control: public, max-age=31536000, immutable`).
- Image URLs on the wire: `logoUrl`, `coverUrl`, `photoUrl` (nullable) on Store, NearbyBag, StoreDetail, ShopBag, OrderDetail, SavedShop.
- Mobile: `expo-image-picker` (camera or library) + `expo-image-manipulator` (resize to ≤ 1600 px, JPEG ~0.8) before upload; upload progress and retry; `expo-image` for display with the current tint/glyph as the placeholder and error fallback.
- Shop setup (04): optional logo + cover. Bag form (11): optional photo. My bags rows and every customer surface show the photo when present.
- Web (17): the same picker works in the browser.

### Out of scope
- Moderation, cropping UI beyond the system picker's, multiple photos per bag, video.
- Image CDN transforms (Cloudflare Images) — a later optimisation.
- Global list: see [README](README.md#global-out-of-scope-every-brief) (remove "real food photos" from it when this ships).

### Acceptance criteria
- [ ] Given a shop owner picks a bag photo, when saved, then it's uploaded, stored in R2 under a new key, and the bag shows it in My bags, Discover and StoreDetail.
- [ ] Given a file over 5 MB or not an image (checked by content, not extension), then 400 and nothing is stored.
- [ ] Given another shop's bag id, then 404.
- [ ] Given a photo is replaced or deleted, then the old R2 object is deleted.
- [ ] Given no photo, or a photo that fails to load, then the category placeholder shows (no broken image).
- [ ] Given `GET /images/:key`, then it's served with immutable cache headers; an unknown key is 404.
- [ ] Given a slow network, then the form shows upload progress and Save waits for the upload (or offers retry on failure).

### Approach steps
1. R2 binding, migration, upload/delete/serve routes + integration tests (R2 in the Vitest pool).
2. Shared schemas gain the URL fields; update the affected responses and their tests.
3. Kit: `Photo` component (expo-image + placeholder fallback); `CategoryMedia`/`StoreLogo` take an optional URL.
4. Picker + resize + upload hook; shop setup and bag form UI.
5. Seed: a few sample photos for the demo shops (uploaded to the local bucket by a seed script).

### Testing
- Unit: upload validation (type sniffing, size), key generation.
- Integration: `test/images.test.ts` (upload, replace deletes old, ownership, serve + headers, 404).
- Component: bag form photo pick → upload → saved; placeholder fallback on load error.
- E2E: extend `store-add-bag.yaml` with a photo only if the simulator picker can be driven reliably.

---

## Status
planned

## Last updated
2026-09-30

## Changelog
- 2026-09-30 — drafted
