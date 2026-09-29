import { CreateOrderBody, MyOrdersQuery, ReviewBody } from '@leftover/shared';
import { Hono } from 'hono';
import { requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { cancelMyOrder, createOrder, getMyOrder, listMyOrders } from '../services/orders';
import { createReview } from '../services/reviews';

// Customers' own orders. /me is declared before /:id so it never reads as an order id.
export const orders = new Hono<AppEnv>()
  .use(requireRole('customer'))
  .post('/', validate('json', CreateOrderBody), async (c) =>
    c.json(await createOrder(c.var.db, c.var.user.id, c.req.valid('json')), 201),
  )
  .get('/me', validate('query', MyOrdersQuery), async (c) =>
    c.json(await listMyOrders(c.var.db, c.var.user.id, c.req.valid('query').scope)),
  )
  .get('/:id', async (c) => c.json(await getMyOrder(c.var.db, c.var.user.id, c.req.param('id'))))
  .post('/:id/cancel', async (c) =>
    c.json(await cancelMyOrder(c.var.db, c.var.user.id, c.req.param('id'))),
  )
  .post('/:id/review', validate('json', ReviewBody), async (c) => {
    await createReview(c.var.db, c.var.user.id, c.req.param('id'), c.req.valid('json'));
    return c.body(null, 201);
  });
