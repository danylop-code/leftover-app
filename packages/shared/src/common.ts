import { z } from 'zod';

/** Money is always integer minor units of the market's currency (baisa: 1500 = OMR 1.500). */
export const MoneyMinor = z.number().int().nonnegative();
export type MoneyMinor = z.infer<typeof MoneyMinor>;

/** Dates travel as ISO-8601 UTC strings (`Z`, no offset). */
export const IsoDateTime = z.iso.datetime();
export type IsoDateTime = z.infer<typeof IsoDateTime>;

export const Id = z.string().min(1);
export type Id = z.infer<typeof Id>;

/** Wall-clock time of day, `HH:mm` (24 h). */
export const TimeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');
export type TimeOfDay = z.infer<typeof TimeOfDay>;

export const Latitude = z.number().min(-90).max(90);
export const Longitude = z.number().min(-180).max(180);

/** IANA timezone name, validated by the runtime's Intl data. */
export const TimeZone = z.string().refine(
  (tz) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Unknown timezone' },
);

/** App languages (brief 21). Sent to address search so labels come back in a matching script. */
export const Language = z.enum(['en', 'ar']);
export type Language = z.infer<typeof Language>;
