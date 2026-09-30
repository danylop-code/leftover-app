import { z } from 'zod';

/** Money is always integer minor units (kopiyky: 14900 = ₴149). */
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
