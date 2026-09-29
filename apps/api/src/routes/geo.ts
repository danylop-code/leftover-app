import { AutocompleteQuery, ReverseQuery } from '@leftover/shared';
import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { autocompletePlaces, reversePlace } from '../services/geo';

// Signed-in users only, so the provider can't be used through us as an open proxy.
export const geo = new Hono<AppEnv>()
  .use(requireAuth)
  .get('/autocomplete', validate('query', AutocompleteQuery), async (c) =>
    c.json({ results: await autocompletePlaces(c.env, c.req.valid('query')) }),
  )
  .get('/reverse', validate('query', ReverseQuery), async (c) =>
    c.json({ place: await reversePlace(c.env, c.req.valid('query')) }),
  );
