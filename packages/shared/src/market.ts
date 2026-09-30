import { z } from 'zod';
import type { LatLng } from './geo';

// One active market per deployment (brief 21): the API reads `MARKET` from the Worker config,
// the app reads `EXPO_PUBLIC_MARKET`. Both default to Oman, the showcase market.

export const MarketCode = z.enum(['OM', 'UA']);
export type MarketCode = z.infer<typeof MarketCode>;

export const DEFAULT_MARKET: MarketCode = 'OM';

export type Currency = {
  /** ISO 4217 code; also the key of the currency's display strings in the app. */
  code: 'OMR' | 'UAH';
  /** Decimal places of the minor unit: 1 OMR = 1000 baisa, 1 UAH = 100 kopiyky. */
  minorDigits: number;
  /** Show the minor digits on whole amounts too ("OMR 3.000"), as Omani price tags do. */
  alwaysShowMinor: boolean;
};

export type Market = {
  code: MarketCode;
  currency: Currency;
  /** Default IANA zone for new shops. */
  timezone: string;
  /** Where the map starts before a location is known. */
  center: LatLng;
};

export const MARKETS: Record<MarketCode, Market> = {
  OM: {
    code: 'OM',
    currency: { code: 'OMR', minorDigits: 3, alwaysShowMinor: true },
    timezone: 'Asia/Muscat',
    // Muscat, Qurum.
    center: { lat: 23.6139, lng: 58.4757 },
  },
  UA: {
    code: 'UA',
    currency: { code: 'UAH', minorDigits: 2, alwaysShowMinor: false },
    timezone: 'Europe/Kyiv',
    // Central Lviv.
    center: { lat: 49.8397, lng: 24.0297 },
  },
};

/** The market for a config value; unknown or missing values fall back to the default. */
export const marketFor = (code: string | undefined): Market => {
  const parsed = MarketCode.safeParse(code);
  return MARKETS[parsed.success ? parsed.data : DEFAULT_MARKET];
};

/** Minor units per major unit: 1000 for OMR, 100 for UAH. */
export const minorPerMajor = (currency: Currency): number => 10 ** currency.minorDigits;
