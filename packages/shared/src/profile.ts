import { z } from 'zod';
import { FIRST_NAME_MAX_LENGTH } from './auth';
import { MoneyMinor } from './common';

/** `PATCH /me`: the only editable profile field for now. */
export const UpdateMeBody = z.object({
  firstName: z.string().trim().min(1).max(FIRST_NAME_MAX_LENGTH),
});
export type UpdateMeBody = z.infer<typeof UpdateMeBody>;

/** `GET /me/stats`: a customer's impact, from collected orders only. */
export const MeStats = z.object({
  bagsRescued: z.number().int().nonnegative(),
  savedMinor: MoneyMinor,
});
export type MeStats = z.infer<typeof MeStats>;
