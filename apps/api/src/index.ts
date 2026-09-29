import { Hono } from 'hono';
import type { AppEnv } from './lib/env';

const app = new Hono<AppEnv>();

// Mount resource routers from src/routes/<resource>.ts here, e.g. app.route('/bags', bags).

export default app;
