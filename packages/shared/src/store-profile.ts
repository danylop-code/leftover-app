import { z } from 'zod';
import { Category } from './category';
import { Latitude, Longitude, TimeOfDay, TimeZone } from './common';
import { DEFAULT_TIMEZONE } from './store';

export const STORE_NAME_MIN = 2;
export const STORE_NAME_MAX = 60;
export const STORE_ADDRESS_MIN = 3;
export const STORE_ADDRESS_MAX = 120;

const fields = z.object({
  name: z.string().trim().min(STORE_NAME_MIN).max(STORE_NAME_MAX),
  category: Category,
  address: z.string().trim().min(STORE_ADDRESS_MIN).max(STORE_ADDRESS_MAX),
  lat: Latitude,
  lng: Longitude,
  opensAt: TimeOfDay,
  closesAt: TimeOfDay,
  timezone: TimeZone,
});

const closesAfterOpens = {
  // HH:mm strings compare correctly as text.
  check: (b: { opensAt?: string; closesAt?: string }) =>
    !b.opensAt || !b.closesAt || b.closesAt > b.opensAt,
  params: { path: ['closesAt'], message: 'Closing time must be after opening time' },
};

/** Create body for `POST /stores/me` (one shop per owner, same-day hours). */
export const StoreProfileBody = fields
  .extend({ timezone: TimeZone.default(DEFAULT_TIMEZONE) })
  .refine(closesAfterOpens.check, closesAfterOpens.params);
export type StoreProfileBody = z.infer<typeof StoreProfileBody>;

/** `PATCH /stores/me`: any subset; the merged result is re-validated as a full profile. */
export const StoreProfilePatch = fields
  .partial()
  .refine(closesAfterOpens.check, closesAfterOpens.params);
export type StoreProfilePatch = z.infer<typeof StoreProfilePatch>;
