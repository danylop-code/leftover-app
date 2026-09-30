import { NearbyQuery } from '@leftover/shared';
import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { nearbyBags } from '../services/discovery';

export const bags = new Hono<AppEnv>()
  .use(requireAuth)
  .get('/nearby', validate('query', NearbyQuery), async (c) =>
    c.json({ bags: await nearbyBags(c.var.db, c.req.valid('query')) }),
  );
