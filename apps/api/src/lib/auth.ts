import type { Role } from '@leftover/shared';
import { every } from 'hono/combine';
import { createMiddleware } from 'hono/factory';
import { toMe, userForToken } from '../services/auth';
import type { AppEnv } from './env';
import { forbidden, unauthorized } from './errors';

const BEARER = /^Bearer\s+(\S+)$/i;

/** 401 unless `Authorization: Bearer <live token>`; sets `c.var.user` and `c.var.tokenHash`. */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = c.req.header('Authorization')?.match(BEARER)?.[1];
  if (!token) throw unauthorized();
  const session = await userForToken(c.var.db, token);
  if (!session) throw unauthorized();
  c.set('user', toMe(session.user));
  c.set('tokenHash', session.tokenHash);
  await next();
});

/** requireAuth, then 403 `forbidden` unless the user has `role`. */
export const requireRole = (role: Role) =>
  every(
    requireAuth,
    createMiddleware<AppEnv>(async (c, next) => {
      if (c.var.user.role !== role) throw forbidden();
      await next();
    }),
  );
