# Feature: native-layout

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
On the iOS Simulator (and Android), every screen fits its cards in English and Arabic: prices stay inside their cards, codes and times read in the right order, and shop initials sit centred in their circles.

### Context
Found 2026-09-30 after 21 (OMR, Arabic) and 20 (photos). Prices are now longer ("OMR 12.500" instead of "₴149") and Arabic swaps the fonts and the direction. Web looks right; native doesn't. Walked on the iPhone 13 Pro simulator (iOS 26.2), Muscat seed, both languages, customer (`aisha@`) and shop (`qurum@`):

| # | Screen | What's wrong | Cause |
|---|---|---|---|
| 1 | StoreDetail bag rows | "OMR 1.800" runs past the card's end | `Price` is a row that never shrinks or wraps; `BagRow`'s foot can't fit badge + old + new price |
| 2 | My bags (shop) | price touches the live switch | same `Price`, in `ShopBagRow` |
| 3 | Discover cards | price row fills the card to the last pixel; any larger price overflows | same `Price`, beside rating + distance |
| 4 | Profile stats | "OMR 7.500" wraps onto two lines in the tile | `StatTile` value has no single-line fit |
| 5 | Profile → Pickup area | label broken one syllable per line ("Pic/kup/are/a") | `ListRow` label is `flex: 1` (basis 0), the long value takes all the width |
| 6 | Shop orders, Arabic | the pickup-code boxes fill right to left: typing 1-2-3-4 shows "4321" | code row inherits RTL |
| 7 | Every time window, Arabic | "12:42–13:42" shows as "13:42–12:42"; opening hours reversed | digits and a dash in a right-to-left line reorder |
| 8 | Profile, Reserve, Pickup (Arabic) | "Sultan Qaboos Highway · 5 كم" splits to "كم Sultan … · 5"; English descriptions show ".counter" | Latin user content without bidi isolation |
| 9 | Shop initials in Arabic | "D", "Q" sit in the upper half of the circle | Latin initial drawn in IBM Plex Sans Arabic (tall Arabic metrics) |

### In scope
- `Price`: may shrink; when there's no room the old price wraps above the sale price (end-aligned); the sale price stays on one line and scales down a little as a last resort.
- `BagRow`, `BagCard`, `ShopBagRow`: the badge / facts keep their size, the price gives way.
- `StatTile`: value on one line, scaled to fit.
- `ListRow`: label keeps its width; the value takes the rest on one line with an ellipsis.
- `CodeInput`: always left-to-right (codes aren't words).
- Bidi: in Arabic, every interpolated value is wrapped in a first-strong isolate (FSI…PDI) by i18next's `escape`; time ranges are wrapped left-to-right (LRI…PDI) in `ar.json`. Plain user text (bag descriptions) is isolated with the same helper.
- `StoreLogo`: the initial uses the face of its own script (Fraunces italic for Latin, IBM Plex Sans Arabic for Arabic), centred.
- `gotchas.md`: bidi and price-width traps.

### Out of scope
- Redesigning cards; new breakpoints or tablet layouts.
- TextInput content direction (what the shop types stays as typed).
- Web (already correct; checked for regressions only).

### Acceptance criteria
- [x] Given a bag row with a long price (OMR 12.500 from 45.000) and a stock badge, then both prices are inside the card (Price wraps instead of overflowing).
- [x] Given a StatTile with "OMR 7.500", then it renders on one line (`numberOfLines=1`, fit to width).
- [x] Given a ListRow with a long value, then the label is not shrunk and the value is limited to one line.
- [x] Given Arabic, then the code row is laid out left-to-right, so 1234 reads 1-2-3-4.
- [x] Given Arabic, then `formatWindow` / `formatTimeRange` wrap the times in an LTR isolate, and interpolated values are FSI-isolated; English strings are unchanged.
- [x] Given a Latin shop name in Arabic, then the initial uses the Latin display face; an Arabic name uses the Arabic face.
- [x] Walked on the simulator in English and Arabic (Discover, StoreDetail, Reserve, Pickup, Orders, Profile, My bags, shop Orders, bag form): none of the nine issues remain.

### Approach steps
1. Kit: `Price`, `BagRow`, `BagCard`, `StatTile`, `ListRow`, `StoreLogo`.
2. Features: `ShopBagRow`, `CodeInput`, description texts.
3. i18n: `bidi.ts` (`isolate`, `ltr`), i18next `escape` for Arabic, `ar.json` ranges.
4. Tests, then walk the simulator in both languages; update gotchas.

### Testing
- Unit: `bidi.ts`; format window/range in Arabic (isolates present) and English (unchanged).
- Component: Price, StatTile, ListRow, StoreLogo font per script, CodeInput direction in Arabic.
- E2E: none (scratch Maestro walk-through used for the screenshots, not committed).

---

## Status
done

## Last updated
2026-09-30

## Changelog
- 2026-09-30 — created from a simulator walk-through; FROZEN
- 2026-09-30 — changed: `ListRow` pushes the value to the end with a spacer instead of `textAlign`. On native RN mirrors `textAlign` under the RTL root and `sheet()` mirrored it back, so the Arabic value hugged the label.
- 2026-09-30 — added (found on the re-walk): `Price` `align="end"` for trailing prices (bag rows, Reserve total) so wrapped lines hug the end; a gap in the Reserve total row ("You save …" touched the total); a no-break space in "1.9 km" (it split over two lines on Pickup).
- 2026-09-30 — note: accessibility labels carry the isolates too (VoiceOver ignores them). The scratch Maestro walk-through isn't committed; web not re-walked (the changes are layout props and invisible characters that browsers handle).
- 2026-09-30 — done: lint, typecheck, 522 mobile tests green; simulator walk in English and Arabic, customer and shop.
