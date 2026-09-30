import { z } from 'zod';
import { Id, IsoDateTime } from './common';

export const Role = z.enum(['customer', 'store']);
export type Role = z.infer<typeof Role>;

/** Public user shape. Never includes credentials (unknown keys are stripped). */
export const User = z.object({
  id: Id,
  email: z.email(),
  firstName: z.string().min(1).max(40),
  role: Role,
  createdAt: IsoDateTime,
});
export type User = z.infer<typeof User>;
