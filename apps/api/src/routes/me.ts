import { UpdateMeBody } from '@leftover/shared';
import { Hono } from 'hono';
import { requireAuth, requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { myStats, updateMe } from '../services/me';

export const me = new Hono<AppEnv>()
  .use(requireAuth)
  .get('/', (c) => c.json(c.var.user))
  .patch('/', validate('json', UpdateMeBody), async (c) =>
    c.json(await updateMe(c.var.db, c.var.user, c.req.valid('json'))),
  )
  .get('/stats', requireRole('customer'), async (c) =>
    c.json(await myStats(c.var.db, c.var.user.id)),
  );
