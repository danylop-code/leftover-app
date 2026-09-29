import { marketFor, StoreDetailQuery, StoreProfileBody, StoreProfilePatch } from '@leftover/shared';
import { Hono } from 'hono';
import { requireAuth, requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { createMyStore, getMyStore, getStoreDetail, updateMyStore } from '../services/stores';

export const stores = new Hono<AppEnv>()
  .use('/me', requireRole('store'))
  .get('/me', async (c) => c.json(await getMyStore(c.var.db, c.var.user.id)))
  .post('/me', validate('json', StoreProfileBody), async (c) =>
    c.json(
      await createMyStore(c.var.db, c.var.user.id, c.req.valid('json'), marketFor(c.env.MARKET)),
      201,
    ),
  )
  .patch('/me', validate('json', StoreProfilePatch), async (c) =>
    c.json(await updateMyStore(c.var.db, c.var.user.id, c.req.valid('json'))),
  )
  // Any signed-in user; declared after /me so "me" never reads as a store id.
  .get('/:id', requireAuth, validate('query', StoreDetailQuery), async (c) =>
    c.json(await getStoreDetail(c.var.db, c.req.param('id'), c.req.valid('query'), c.var.user.id)),
  );
