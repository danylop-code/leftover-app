import { z } from 'zod';

/** Money is always integer minor units (e.g. cents). */
export const MoneyMinor = z.number().int().nonnegative();
export type MoneyMinor = z.infer<typeof MoneyMinor>;

/** Dates travel as ISO-8601 UTC strings. */
export const IsoDateTime = z.iso.datetime();
export type IsoDateTime = z.infer<typeof IsoDateTime>;

export const Id = z.string().min(1);
export type Id = z.infer<typeof Id>;
