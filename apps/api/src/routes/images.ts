import { Hono } from 'hono';
import type { AppEnv } from '../lib/env';
import { notFound } from '../lib/errors';
import { IMAGE_KEY } from '../services/image-keys';
import { IMAGE_CACHE_CONTROL } from '../services/images';

// Public: shop and bag photos (brief 20). Keys are unguessable and never reused, so responses
// are cacheable forever. A CDN or a public bucket on a custom domain can replace this later.
export const images = new Hono<AppEnv>().get('/:key{.+}', async (c) => {
  const key = c.req.param('key');
  if (!IMAGE_KEY.test(key)) throw notFound('No such image.');
  const object = await c.env.IMAGES.get(key);
  if (!object) throw notFound('No such image.');
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', IMAGE_CACHE_CONTROL);
  return new Response(object.body, { headers });
});
