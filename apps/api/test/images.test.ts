import { env } from 'cloudflare:test';
import {
  ApiError,
  IMAGE_MAX_BYTES,
  ImageResponse,
  NearbyResponse,
  ShopBagsResponse,
  Store,
  StoreDetail,
} from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/index';
import { freezeClock, resetClock } from '../src/lib/clock';
import { sniffImageType } from '../src/services/images';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, shopOwner } from './helpers/fixtures';

const NOW = '2026-09-29T14:00:00.000Z';

// Smallest valid-looking heads for each type; the API checks content, not names.
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 2, 3]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 4, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 1]);
const TEXT = new TextEncoder().encode('definitely not an image');

const upload = (path: string, bytes: Uint8Array, token?: string, name = 'photo.jpg') => {
  const form = new FormData();
  form.append('file', new File([bytes as BlobPart], name, { type: 'image/jpeg' }));
  return app.request(
    path,
    { method: 'PUT', body: form, headers: token ? { Authorization: `Bearer ${token}` } : {} },
    env,
  );
};

const urlOf = async (res: Response) => ImageResponse.parse(await res.json()).url;
const keyOf = (url: string | null) => url?.replace(/^\/images\//, '') ?? '';
const stored = async (url: string | null) => (await env.IMAGES.get(keyOf(url))) !== null;

let owner: Awaited<ReturnType<typeof shopOwner>>;
let here: { lat: number; lng: number };
beforeEach(async () => {
  freezeClock(NOW);
  here = freshCentre();
  owner = await shopOwner(here);
});
afterEach(() => resetClock());

describe('sniffImageType', () => {
  it('knows JPEG, PNG and WebP by their first bytes, and nothing else', () => {
    expect(sniffImageType(JPEG)).toBe('image/jpeg');
    expect(sniffImageType(PNG)).toBe('image/png');
    expect(sniffImageType(WEBP)).toBe('image/webp');
    expect(sniffImageType(TEXT)).toBeNull();
  });
});

describe('PUT /store/bags/:id/photo', () => {
  it('stores the photo in R2 under a new key and shows it on My bags, Discover and StoreDetail', async () => {
    const bagId = await insertBag(owner.storeId);
    const res = await upload(`/store/bags/${bagId}/photo`, JPEG, owner.token);
    expect(res.status).toBe(200);
    const url = await urlOf(res);
    expect(url).toMatch(new RegExp(`^/images/bags/${bagId}/photo/[\\w-]+\\.jpg$`));
    expect(await stored(url)).toBe(true);

    const mine = ShopBagsResponse.parse(
      await (await jsonRequest('/store/bags', 'GET', undefined, owner.token)).json(),
    );
    expect(mine.bags.find((b) => b.id === bagId)?.photoUrl).toBe(url);

    const { token } = await registerUser('customer');
    const nearby = NearbyResponse.parse(
      await (
        await jsonRequest(
          `/bags/nearby?lat=${here.lat}&lng=${here.lng}&radiusKm=5`,
          'GET',
          undefined,
          token,
        )
      ).json(),
    );
    expect(nearby.bags.find((b) => b.id === bagId)?.photoUrl).toBe(url);

    const detail = StoreDetail.parse(
      await (
        await jsonRequest(
          `/stores/${owner.storeId}?lat=${here.lat}&lng=${here.lng}`,
          'GET',
          undefined,
          token,
        )
      ).json(),
    );
    expect(detail.bags.find((b) => b.id === bagId)?.photoUrl).toBe(url);
  });

  it('replacing deletes the old object; DELETE removes it and clears the photo', async () => {
    const bagId = await insertBag(owner.storeId);
    const first = await urlOf(await upload(`/store/bags/${bagId}/photo`, JPEG, owner.token));
    const second = await urlOf(await upload(`/store/bags/${bagId}/photo`, PNG, owner.token));
    expect(second).not.toBe(first);
    expect(second).toMatch(/\.png$/);
    expect(await stored(first)).toBe(false);
    expect(await stored(second)).toBe(true);

    const res = await app.request(
      `/store/bags/${bagId}/photo`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${owner.token}` } },
      env,
    );
    expect(await urlOf(res)).toBeNull();
    expect(await stored(second)).toBe(false);
  });

  it('deleting the bag deletes its photo', async () => {
    const bagId = await insertBag(owner.storeId);
    const url = await urlOf(await upload(`/store/bags/${bagId}/photo`, WEBP, owner.token));
    const res = await jsonRequest(`/store/bags/${bagId}`, 'DELETE', undefined, owner.token);
    expect(res.status).toBe(204);
    expect(await stored(url)).toBe(false);
  });

  it('refuses a file that is not an image by content (whatever its name) and stores nothing', async () => {
    const bagId = await insertBag(owner.storeId);
    const before = (await env.IMAGES.list({ prefix: `bags/${bagId}/` })).objects.length;
    const res = await upload(`/store/bags/${bagId}/photo`, TEXT, owner.token, 'fake.jpg');
    expect(res.status).toBe(400);
    expect(ApiError.parse(await res.json()).error.code).toBe('validation');
    expect((await env.IMAGES.list({ prefix: `bags/${bagId}/` })).objects).toHaveLength(before);
  });

  it('refuses a file over 5 MB and stores nothing', async () => {
    const bagId = await insertBag(owner.storeId);
    const big = new Uint8Array(IMAGE_MAX_BYTES + 1);
    big.set(JPEG);
    const res = await upload(`/store/bags/${bagId}/photo`, big, owner.token);
    expect(res.status).toBe(400);
    expect((await env.IMAGES.list({ prefix: `bags/${bagId}/` })).objects).toHaveLength(0);
  });

  it('is 400 without a file, 404 for another shop’s bag, 403 for customers, 401 signed out', async () => {
    const bagId = await insertBag(owner.storeId);
    const empty = await app.request(
      `/store/bags/${bagId}/photo`,
      { method: 'PUT', body: new FormData(), headers: { Authorization: `Bearer ${owner.token}` } },
      env,
    );
    expect(empty.status).toBe(400);

    const other = await shopOwner(freshCentre());
    expect((await upload(`/store/bags/${bagId}/photo`, JPEG, other.token)).status).toBe(404);
    const { token } = await registerUser('customer');
    expect((await upload(`/store/bags/${bagId}/photo`, JPEG, token)).status).toBe(403);
    expect((await upload(`/store/bags/${bagId}/photo`, JPEG)).status).toBe(401);
  });
});

describe('PUT /store/logo and /store/cover', () => {
  it('sets the shop’s logo and cover, shown on the store', async () => {
    const logo = await urlOf(await upload('/store/logo', PNG, owner.token));
    const cover = await urlOf(await upload('/store/cover', JPEG, owner.token));
    expect(logo).toMatch(new RegExp(`^/images/stores/${owner.storeId}/logo/`));
    expect(cover).toMatch(new RegExp(`^/images/stores/${owner.storeId}/cover/`));
    const store = Store.parse(
      await (await jsonRequest('/stores/me', 'GET', undefined, owner.token)).json(),
    );
    expect(store).toMatchObject({ logoUrl: logo, coverUrl: cover });
  });

  it('replacing the logo deletes the old one', async () => {
    const first = await urlOf(await upload('/store/logo', PNG, owner.token));
    const second = await urlOf(await upload('/store/logo', PNG, owner.token));
    expect(await stored(first)).toBe(false);
    expect(await stored(second)).toBe(true);
  });
});

describe('GET /images/:key', () => {
  it('serves the image publicly with its type and immutable cache headers', async () => {
    const bagId = await insertBag(owner.storeId);
    const url = await urlOf(await upload(`/store/bags/${bagId}/photo`, PNG, owner.token));
    const res = await app.request(url ?? '', {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(res.headers.get('ETag')).toBeTruthy();
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(PNG);
  });

  it('is 404 for an unknown key or a path that isn’t one of ours', async () => {
    expect((await app.request('/images/bags/x/photo/nope.jpg', {}, env)).status).toBe(404);
    expect((await app.request('/images/../secrets', {}, env)).status).toBe(404);
  });
});
