import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import type { AppEnv } from '../lib/env';

export const me = new Hono<AppEnv>().use(requireAuth).get('/', (c) => c.json(c.var.user));
