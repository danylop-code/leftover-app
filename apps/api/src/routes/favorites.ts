import { Hono } from 'hono';
import { requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { addFavorite, removeFavorite } from '../services/favorites';

// Idempotent save/unsave of a shop.
export const favorites = new Hono<AppEnv>()
  .use(requireRole('customer'))
  .put('/:storeId', async (c) => {
    await addFavorite(c.var.db, c.var.user.id, c.req.param('storeId'));
    return c.body(null, 204);
  })
  .delete('/:storeId', async (c) => {
    await removeFavorite(c.var.db, c.var.user.id, c.req.param('storeId'));
    return c.body(null, 204);
  });
