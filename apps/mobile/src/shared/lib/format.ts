import { minorPerMajor } from '@leftover/shared';
import { DISTANCE_DECIMALS_BELOW_KM, MIN_DISPLAY_DISTANCE_KM } from '../constants/distance';
import { activeMarket } from '../constants/market';
import i18n from '../i18n';
import { INTL_LOCALE, westernDigits } from '../i18n/languages';

const currentLanguage = () => (i18n.language === 'ar' ? 'ar' : 'en');

const groupThousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const assertInt = (value: number, name: string) => {
  if (__DEV__ && !Number.isInteger(value)) {
    throw new Error(`${name} must be an integer in minor units, got ${value}`);
  }
};

/**
 * Integer minor units of the market's currency → display text in the app's language.
 * OMR: `1500` → `OMR 1.500` / `1.500 ر.ع.`. UAH: `14900` → `₴149`, `14950` → `₴149.50`.
 */
export const formatMoney = (minor: number): string => {
  assertInt(minor, 'formatMoney');
  const { currency } = activeMarket();
  const perMajor = minorPerMajor(currency);
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  const major = Math.floor(abs / perMajor);
  const rest = abs % perMajor;
  const fraction =
    rest || currency.alwaysShowMinor ? `.${String(rest).padStart(currency.minorDigits, '0')}` : '';
  const amount = `${groupThousands(major)}${fraction}`;
  return `${sign}${i18n.t(`money.amount.${currency.code}`, { amount })}`;
};

/** The currency's symbol in the app's language, for price fields: `OMR` / `ر.ع.`, `₴`. */
export const currencySymbol = (): string => i18n.t(`money.symbol.${activeMarket().currency.code}`);

/** `(45000, 14900)` → `−67%`; null when the sale price isn't lower. */
export const formatDiscount = (originalMinor: number, saleMinor: number): string | null => {
  assertInt(originalMinor, 'formatDiscount');
  assertInt(saleMinor, 'formatDiscount');
  if (originalMinor <= 0 || saleMinor >= originalMinor) return null;
  const pct = Math.round((1 - saleMinor / originalMinor) * 100);
  return i18n.t('format.discount', { pct });
};

/** `0.8` → `0.8 km`, `12.6` → `13 km`. */
export const formatDistance = (km: number): string => {
  const shown = Math.max(km, MIN_DISPLAY_DISTANCE_KM);
  const value = shown < DISTANCE_DECIMALS_BELOW_KM ? shown.toFixed(1) : String(Math.round(shown));
  return i18n.t('format.km', { value });
};

const dateKey = (d: Date, timeZone: string) =>
  // en-CA formats as YYYY-MM-DD.
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);

const nextDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

const time = (d: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d);

const longDay = (d: Date, timeZone: string) => {
  // en-US parts: CLDR en-GB abbreviates September as "Sept"; the design uses "Sep".
  // Arabic day and month names, with Western digits (brief 21).
  const language = currentLanguage();
  const parts = new Intl.DateTimeFormat(INTL_LOCALE[language], {
    timeZone,
    weekday: language === 'ar' ? 'long' : 'short',
    day: 'numeric',
    month: language === 'ar' ? 'long' : 'short',
  }).formatToParts(d);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    westernDigits(parts.find((p) => p.type === type)?.value ?? '');
  return i18n.t('format.longDay', {
    weekday: part('weekday'),
    day: part('day'),
    month: part('month'),
  });
};

/**
 * Pickup window in the store's timezone: `Today · 18:00–19:30`, `Tomorrow · …`, `Sat, 26 Sep · …`.
 * `now` is injectable for tests.
 */
export const formatWindow = (
  startIso: string,
  endIso: string,
  timeZone: string,
  now: Date = new Date(),
): string =>
  i18n.t('format.window', {
    day: formatDay(startIso, timeZone, now),
    start: time(new Date(startIso), timeZone),
    end: time(new Date(endIso), timeZone),
  });

/** Whether `iso` falls today, tomorrow or later, in `timeZone`. */
export const dayKind = (
  iso: string,
  timeZone: string,
  now: Date = new Date(),
): 'today' | 'tomorrow' | 'other' => {
  const key = dateKey(new Date(iso), timeZone);
  const todayKey = dateKey(now, timeZone);
  if (key === todayKey) return 'today';
  if (key === nextDateKey(todayKey)) return 'tomorrow';
  return 'other';
};

/** `Today`, `Tomorrow` or `Sat, 26 Sep` for `iso` in `timeZone`. */
export const formatDay = (iso: string, timeZone: string, now: Date = new Date()): string => {
  const at = new Date(iso);
  const key = dateKey(at, timeZone);
  const todayKey = dateKey(now, timeZone);
  if (key === todayKey) return i18n.t('format.today');
  if (key === nextDateKey(todayKey)) return i18n.t('format.tomorrow');
  return longDay(at, timeZone);
};

/** `18:00–19:30` in `timeZone`. */
export const formatTimeRange = (startIso: string, endIso: string, timeZone: string): string =>
  i18n.t('format.range', {
    start: time(new Date(startIso), timeZone),
    end: time(new Date(endIso), timeZone),
  });

/** `16:40` in `timeZone`. */
export const formatTime = (iso: string, timeZone: string): string => time(new Date(iso), timeZone);

/** `Tue, 29 Sep` in `timeZone`. */
export const formatDate = (at: Date, timeZone: string): string => longDay(at, timeZone);
