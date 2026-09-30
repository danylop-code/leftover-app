import { BagBody, BagPatch, ConfirmCodeBody } from '@leftover/shared';
import { Hono } from 'hono';
import { requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { createMyBag, deleteMyBag, listMyBags, updateMyBag } from '../services/store-bags';
import { confirmCode, listTodaysOrders } from '../services/store-orders';

// A shop owner's own bags and today's orders; everything is scoped to their store.
export const store = new Hono<AppEnv>()
  .use(requireRole('store'))
  .get('/bags', async (c) => c.json(await listMyBags(c.var.db, c.var.user.id)))
  .post('/bags', validate('json', BagBody), async (c) =>
    c.json(await createMyBag(c.var.db, c.var.user.id, c.req.valid('json')), 201),
  )
  .patch('/bags/:id', validate('json', BagPatch), async (c) =>
    c.json(await updateMyBag(c.var.db, c.var.user.id, c.req.param('id'), c.req.valid('json'))),
  )
  .delete('/bags/:id', async (c) => {
    await deleteMyBag(c.var.db, c.var.user.id, c.req.param('id'));
    return c.body(null, 204);
  })
  .get('/orders/today', async (c) => c.json(await listTodaysOrders(c.var.db, c.var.user.id)))
  .post('/orders/confirm', validate('json', ConfirmCodeBody), async (c) =>
    c.json(await confirmCode(c.var.db, c.var.user.id, c.req.valid('json'))),
  );
