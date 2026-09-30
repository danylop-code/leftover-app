import { z } from 'zod';
import { Role, User } from './user';

export const PASSWORD_MIN_LENGTH = 8;
export const FIRST_NAME_MAX_LENGTH = 40;

/** Trimmed, lowercased email: the one form stored and compared. */
export const Email = z.string().trim().toLowerCase().pipe(z.email());

export const RegisterBody = z.object({
  role: Role,
  firstName: z.string().trim().min(1).max(FIRST_NAME_MAX_LENGTH),
  email: Email,
  password: z.string().min(PASSWORD_MIN_LENGTH),
});
export type RegisterBody = z.infer<typeof RegisterBody>;

export const LoginBody = z.object({
  email: Email,
  password: z.string().min(1),
});
export type LoginBody = z.infer<typeof LoginBody>;

/** The signed-in user as returned by `GET /me`. */
export const Me = User;
export type Me = z.infer<typeof Me>;

/** Returned by register and login. The token is opaque; send it as `Authorization: Bearer`. */
export const Session = z.object({ token: z.string().min(1), user: Me });
export type Session = z.infer<typeof Session>;
