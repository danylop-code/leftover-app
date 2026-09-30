import { LoginBody, RegisterBody } from '@leftover/shared';
import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { login, register, revokeSession } from '../services/auth';

export const auth = new Hono<AppEnv>()
  .post('/register', validate('json', RegisterBody), async (c) =>
    c.json(await register(c.var.db, c.req.valid('json')), 201),
  )
  .post('/login', validate('json', LoginBody), async (c) =>
    c.json(await login(c.var.db, c.req.valid('json'))),
  )
  .post('/logout', requireAuth, async (c) => {
    await revokeSession(c.var.db, c.var.tokenHash);
    return c.body(null, 204);
  });
