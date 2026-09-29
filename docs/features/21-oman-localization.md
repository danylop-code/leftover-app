# Feature: oman-localization

## Plan — FROZEN once Status is in-progress (changes go in Changelog)

### Goal
The app is ready to show an Omani client: Arabic with a right-to-left layout, prices in Omani rials, Oman's time zone and Muscat demo data — with English still one tap away.

### Context
Requested 2026-09-30: this showcase is for a client in Oman. English stays available so the team can navigate everything. Money today assumes hryvnias with 2 decimals (`MINOR_PER_MAJOR = 100`, `₴`), times default to `Europe/Kyiv`, and the seed is Lviv. Oman's rial has **3 decimals** (1 OMR = 1000 baisa), so "minor units" become baisa. Arabic needs RTL layout, an Arabic typeface (Fraunces and Figtree have no Arabic glyphs), and Arabic address results (the Photon provider in 05 has no Arabic `lang`; its default returns local names).

**Decide first:**
- **Market model:**
  - *One active market per deployment* (a `MARKET=OM` config: currency, time zone, map centre, seed). *Recommended:* simplest, and matches a showcase.
  - *Or a currency and time zone per shop:* supports several countries at once, but touches every price query and total.
- **Digits in Arabic:** Western (0–9, common in Omani apps and receipts; *recommended*) or Arabic-Indic (٠–٩).
- **Arabic typefaces:** e.g. IBM Plex Sans Arabic (body) + Noto Kufi Arabic or Amiri (display) to echo the Figtree/Fraunces pairing. Confirm with the client's brand if they have one.
- **Currency display:** "OMR 1.500" (Latin, common on Omani price tags) or "١٫٥٠٠ ر.ع." (Arabic). *Recommended:* follow the language — "OMR 1.500" in English, "1.500 ر.ع." in Arabic.

### In scope
- **Money:** a currency config (`code`, `symbol`, `minorDigits`) replaces the hard-coded `₴`/100: `formatMoney`, `formatDiscount`, the price inputs (`parseMoneyInput` accepts 3 decimals for OMR), totals and "You save". The API stays in integer minor units (baisa); shared schemas unchanged in shape. `gotchas.md` gets the 3-decimals trap.
- **Market (if the one-market model is chosen):** `MARKET` in the Worker config and the app config: currency, default time zone `Asia/Muscat`, default map centre (Muscat), weekend (Fri–Sat) where dates matter.
- **Arabic:** `ar.json` with every key of `en.json` (a test fails on missing keys); i18next pluralization for Arabic (zero/one/two/few/many/other); Arabic fonts loaded via expo-font; RTL via `I18nManager` (applied with an app reload), styles moved to logical properties (`marginStart`, `paddingEnd`, `start`/`end`), directional icons (back chevrons) mirrored.
- **Language choice:** Profile → Language becomes a picker (English / العربية), stored on the device, defaulting to the phone's language; the choice survives restarts. English always one tap away.
- **Dates and times:** formatters take the active locale (Arabic day and month names; 24-hour times as in Oman).
- **Addresses:** Photon results in local script; labels shown as returned. The API passes the app language where the provider supports it.
- **Seed:** a Muscat seed (shops in Qurum, Ruwi, Al Khuwair…, OMR prices, Omani names), selectable alongside the Lviv one (`db:seed:local` / `db:seed:oman`).
- **Web (17):** `dir="rtl"` on the document in Arabic.

### Out of scope
- Other Arabic dialect variants, other Gulf currencies (the config allows them later).
- Translating user content (shop names, bag titles, reviews).
- Right-to-left maps (map tiles stay as they are).
- Global list: see [README](README.md#global-out-of-scope-every-brief) (update "languages other than English" when this ships).

### Acceptance criteria
- [x] Given OMR, then 1500 baisa shows as "OMR 1.500" (English) / "1.500 ر.ع." (Arabic), and entering "1.5" in a price field saves 1500.
- [x] Given a sale of OMR 1.500 from 4.000 × 2, then the total is OMR 3.000 and "You save OMR 5.000", computed in integer baisa.
- [x] Given the language set to Arabic, then every screen is right-to-left with Arabic text, Arabic fonts, and mirrored back arrows; no English strings remain (key-parity test).
- [x] Given Arabic, when switching back to English in Profile, then the app returns to English left-to-right after the reload, and the choice survives a restart.
- [x] Given a fresh install on a phone set to Arabic, then the app starts in Arabic.
- [x] Given the Muscat seed, then Discover near Qurum shows the demo bags with OMR prices and times in `Asia/Muscat`.
- [x] Given Arabic plural rules, then counts like "2 bags" / "11 bags" use the correct Arabic forms.

### Approach steps
1. Currency config + money formatting/parsing for 3 decimals, with unit tests (English first).
2. Market config (time zone, map centre) and the Muscat seed.
3. i18n: `ar.json`, key-parity test, plural rules, language preference + reload, Profile picker.
4. RTL: logical style properties sweep (kit first), icon mirroring, Arabic fonts; web `dir`.
5. Walk every screen in Arabic on the simulator and on web; fix overflow and alignment.

### Testing
- Unit: money formatting/parsing for OMR (3 decimals) and UAH; key parity `en.json` ↔ `ar.json`; Arabic plural forms; language preference store.
- Integration: seed test for the Muscat seed; any API response that formats dates (none today).
- Component: a few screens rendered in Arabic (RTL, currency), Profile language switch.
- E2E: run both Maestro flows once in Arabic.

---

## Status
done

## Last updated
2026-09-30

## Changelog
- 2026-09-30 — drafted
- 2026-09-30 — decisions (recommended options, user OK'd continuing): one market per deployment (`MARKET` in `wrangler.jsonc`, `EXPO_PUBLIC_MARKET` in the app, both default `OM`); Western digits; currency follows the language ("OMR 1.500" / "1.500 ر.ع."); IBM Plex Sans Arabic.
- 2026-09-30 — changed: RTL comes from the root view's `direction` plus expo-router's `LocaleProvider`, not `I18nManager.forceRTL` + reload. The reload doesn't work in Expo Go (the demo runtime); this switches instantly, and on web too. `expo-localization` is configured with `supportsRTL: false` so a dev build never double-flips. `makeStyles`' `sheet()` adds `writingDirection`, mirrors explicit `textAlign` and drops `letterSpacing` in Arabic; styles use `start`/`end`.
- 2026-09-30 — changed: IBM Plex Sans Arabic for display too. Noto Kufi Arabic was tried: on the iOS Simulator it lost the dots above letters and its tall metrics overlapped the line above.
- 2026-09-30 — added (needed for fonts per language, reused by 19): a runtime theme — `useTheme()`, `makeStyles((theme) => …)`; every `styles.ts` migrated. `ChoiceList` moved from the report feature into the kit (Profile's language picker uses it).
- 2026-09-30 — added: `Intl.PluralRules` fallback for en/ar (Hermes may not ship it); `lang` on `/geo/autocomplete` and `/geo/reverse` (Photon `default` = local names for Arabic); new shops get the market's time zone when the body has none.
- 2026-09-30 — note: `ar.json` is a first draft by the developer; have a native speaker review it before the client sees it. Maestro flows not run in Arabic (they have never been run; see 17/18 notes).
