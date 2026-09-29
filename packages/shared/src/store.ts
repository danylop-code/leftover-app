import { z } from 'zod';
import { Category } from './category';
import { Id, Latitude, Longitude, TimeOfDay } from './common';

export const DEFAULT_TIMEZONE = 'Europe/Kyiv';

export const Store = z.object({
  id: Id,
  name: z.string().min(1),
  category: Category,
  address: z.string().min(1),
  lat: Latitude,
  lng: Longitude,
  opensAt: TimeOfDay,
  closesAt: TimeOfDay,
  /** IANA zone used for "today" and opening-hour logic. */
  timezone: z.string().min(1),
});
export type Store = z.infer<typeof Store>;
