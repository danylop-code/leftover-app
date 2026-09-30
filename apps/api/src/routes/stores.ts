import { StoreProfileBody, StoreProfilePatch } from '@leftover/shared';
import { Hono } from 'hono';
import { requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { createMyStore, getMyStore, updateMyStore } from '../services/stores';

export const stores = new Hono<AppEnv>()
  .use('/me', requireRole('store'))
  .get('/me', async (c) => c.json(await getMyStore(c.var.db, c.var.user.id)))
  .post('/me', validate('json', StoreProfileBody), async (c) =>
    c.json(await createMyStore(c.var.db, c.var.user.id, c.req.valid('json')), 201),
  )
  .patch('/me', validate('json', StoreProfilePatch), async (c) =>
    c.json(await updateMyStore(c.var.db, c.var.user.id, c.req.valid('json'))),
  );
