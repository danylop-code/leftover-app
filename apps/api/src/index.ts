import { Hono } from 'hono';
import { withDb } from './lib/db';
import type { AppEnv } from './lib/env';
import { installErrorHandling } from './lib/errors';
import { auth } from './routes/auth';
import { health } from './routes/health';
import { me } from './routes/me';

const app = new Hono<AppEnv>();
installErrorHandling(app);
app.use(withDb);

app.route('/health', health);
app.route('/auth', auth);
app.route('/me', me);

export default app;
