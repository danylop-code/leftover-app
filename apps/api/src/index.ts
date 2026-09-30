import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { withDb } from './lib/db';
import type { AppEnv } from './lib/env';
import { installErrorHandling } from './lib/errors';
import { auth } from './routes/auth';
import { bags } from './routes/bags';
import { favorites } from './routes/favorites';
import { geo } from './routes/geo';
import { health } from './routes/health';
import { images } from './routes/images';
import { me } from './routes/me';
import { orders } from './routes/orders';
import { reportsRoute } from './routes/reports';
import { store } from './routes/store';
import { stores } from './routes/stores';

const app = new Hono<AppEnv>();
installErrorHandling(app);
// The web app (17) runs on another origin; native apps don't send Origin at all.
app.use((c, next) =>
  cors({
    origin: c.env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 600,
  })(c, next),
);
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
app.route('/reports', reportsRoute);
app.route('/images', images);

export default app;
