import type { Health } from '@leftover/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../lib/env';

export const health = new Hono<AppEnv>().get('/', (c) => c.json({ ok: true } satisfies Health));
