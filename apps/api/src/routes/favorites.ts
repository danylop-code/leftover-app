import { FavoritesQuery } from '@leftover/shared';
import { Hono } from 'hono';
import { requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { addFavorite, listFavorites, removeFavorite } from '../services/favorites';

// The Saved tab's list, and idempotent save/unsave of a shop.
export const favorites = new Hono<AppEnv>()
  .use(requireRole('customer'))
  .get('/', validate('query', FavoritesQuery), async (c) =>
    c.json({ shops: await listFavorites(c.var.db, c.var.user.id, c.req.valid('query')) }),
  )
  .put('/:storeId', async (c) => {
    await addFavorite(c.var.db, c.var.user.id, c.req.param('storeId'));
    return c.body(null, 204);
  })
  .delete('/:storeId', async (c) => {
    await removeFavorite(c.var.db, c.var.user.id, c.req.param('storeId'));
    return c.body(null, 204);
  });
