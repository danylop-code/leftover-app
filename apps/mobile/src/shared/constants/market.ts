import { type Market, marketFor } from '@leftover/shared';

/**
 * The market this build runs in (brief 21): currency, default time zone, map centre.
 * `EXPO_PUBLIC_MARKET` is inlined at build time ("OM" by default, "UA" for the Lviv seed).
 */
export const activeMarket = (): Market => marketFor(process.env.EXPO_PUBLIC_MARKET);
