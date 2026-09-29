import { z } from 'zod';
import { Category } from './category';
import { Id, Latitude, Longitude, TimeOfDay } from './common';
import { ImageUrl } from './image';

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
  /** Uploaded in shop setup (20); null shows the initial-letter logo / category tint. */
  logoUrl: ImageUrl.nullable(),
  coverUrl: ImageUrl.nullable(),
});
export type Store = z.infer<typeof Store>;
