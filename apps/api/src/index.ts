import { Hono } from 'hono';
import type { AppEnv } from './lib/env';
import { installErrorHandling } from './lib/errors';
import { health } from './routes/health';

const app = new Hono<AppEnv>();
installErrorHandling(app);

app.route('/health', health);

export default app;
