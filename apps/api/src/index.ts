import { Hono } from 'hono';
import { withDb } from './lib/db';
import type { AppEnv } from './lib/env';
import { installErrorHandling } from './lib/errors';
import { auth } from './routes/auth';
import { bags } from './routes/bags';
import { favorites } from './routes/favorites';
import { geo } from './routes/geo';
import { health } from './routes/health';
import { me } from './routes/me';
import { orders } from './routes/orders';
import { store } from './routes/store';
import { stores } from './routes/stores';

const app = new Hono<AppEnv>();
installErrorHandling(app);
app.use(withDb);

app.route('/health', health);
app.route('/auth', auth);
app.route('/me', me);
app.route('/stores', stores);
app.route('/geo', geo);
app.route('/bags', bags);
app.route('/orders', orders);
app.route('/store', store);
app.route('/favorites', favorites);

export default app;
