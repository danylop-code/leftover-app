import { BagBody, BagPatch, ConfirmCodeBody } from '@leftover/shared';
import { type Context, Hono } from 'hono';
import { requireRole } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { checkUploadLength, setBagPhoto, setStoreImage } from '../services/images';
import { createMyBag, deleteMyBag, listMyBags, updateMyBag } from '../services/store-bags';
import { confirmCode, listTodaysOrders } from '../services/store-orders';

/** The `file` field of a multipart upload (checked by `readImage`). */
const uploadedFile = async (c: Context<AppEnv>) => {
  checkUploadLength(c.req.header('Content-Length'));
  const form = await c.req.formData().catch(() => null);
  return form?.get('file') ?? undefined;
};

// A shop owner's own bags, photos and today's orders; everything is scoped to their store.
export const store = new Hono<AppEnv>()
  .use(requireRole('store'))
  .get('/bags', async (c) => c.json(await listMyBags(c.var.db, c.var.user.id)))
  .post('/bags', validate('json', BagBody), async (c) =>
    c.json(await createMyBag(c.var.db, c.var.user.id, c.req.valid('json')), 201),
  )
  .patch('/bags/:id', validate('json', BagPatch), async (c) =>
    c.json(await updateMyBag(c.var.db, c.var.user.id, c.req.param('id'), c.req.valid('json'))),
  )
  .delete('/bags/:id', async (c) => {
    await deleteMyBag(c.var.db, c.var.user.id, c.req.param('id'), c.env.IMAGES);
    return c.body(null, 204);
  })
  .put('/bags/:id/photo', async (c) =>
    c.json(
      await setBagPhoto(
        c.var.db,
        c.env.IMAGES,
        c.var.user.id,
        c.req.param('id'),
        await uploadedFile(c),
      ),
    ),
  )
  .delete('/bags/:id/photo', async (c) =>
    c.json(await setBagPhoto(c.var.db, c.env.IMAGES, c.var.user.id, c.req.param('id'), null)),
  )
  .put('/:slot{logo|cover}', async (c) =>
    c.json(
      await setStoreImage(
        c.var.db,
        c.env.IMAGES,
        c.var.user.id,
        c.req.param('slot') as 'logo' | 'cover',
        await uploadedFile(c),
      ),
    ),
  )
  .delete('/:slot{logo|cover}', async (c) =>
    c.json(
      await setStoreImage(
        c.var.db,
        c.env.IMAGES,
        c.var.user.id,
        c.req.param('slot') as 'logo' | 'cover',
        null,
      ),
    ),
  )
  .get('/orders/today', async (c) => c.json(await listTodaysOrders(c.var.db, c.var.user.id)))
  .post('/orders/confirm', validate('json', ConfirmCodeBody), async (c) =>
    c.json(await confirmCode(c.var.db, c.var.user.id, c.req.valid('json'))),
  );
