import { createMiddleware } from 'hono/factory';
import { createDb } from '../db/client';
import type { AppEnv } from './env';

/** Puts a Drizzle client for this request's D1 binding on `c.var.db`. */
export const withDb = createMiddleware<AppEnv>(async (c, next) => {
  c.set('db', createDb(c.env.DB));
  await next();
});
