import { ApiError, Me, Store } from '@leftover/shared';
import { describe, expect, it } from 'vitest';
import { jsonRequest, registerUser } from './helpers/auth';

const profile = {
  name: 'Crumb & Co. Bakery',
  category: 'bakery',
  address: 'vul. Doroshenka 32',
  lat: 49.8393,
  lng: 24.0325,
  opensAt: '08:00',
  closesAt: '20:00',
};

const errorOf = async (res: Response) => ApiError.parse(await res.json()).error;

describe('POST /stores/me', () => {
  it('creates the owner’s shop: 201 with the store, timezone defaulted to the market’s', async () => {
    const { token } = await registerUser('store');
    const res = await jsonRequest('/stores/me', 'POST', profile, token);
    expect(res.status).toBe(201);
    const store = Store.parse(await res.json());
    expect(store).toMatchObject({ ...profile, timezone: 'Asia/Muscat' });
  });

  it('then GET /me reports the storeId', async () => {
    const { token } = await registerUser('store');
    const store = Store.parse(
      await (await jsonRequest('/stores/me', 'POST', profile, token)).json(),
    );
    const me = Me.parse(await (await jsonRequest('/me', 'GET', undefined, token)).json());
    expect(me.storeId).toBe(store.id);
  });

  it('409s store_exists for an owner who already has a shop', async () => {
    const { token } = await registerUser('store');
    await jsonRequest('/stores/me', 'POST', profile, token);
    const res = await jsonRequest('/stores/me', 'POST', { ...profile, name: 'Second shop' }, token);
    expect(res.status).toBe(409);
    expect((await errorOf(res)).code).toBe('store_exists');
  });

  it('400s closing time not after opening time, on closesAt', async () => {
    const { token } = await registerUser('store');
    const res = await jsonRequest('/stores/me', 'POST', { ...profile, closesAt: '08:00' }, token);
    expect(res.status).toBe(400);
    expect((await errorOf(res)).fields).toHaveProperty('closesAt');
  });

  it('400s missing and invalid fields', async () => {
    const { token } = await registerUser('store');
    const res = await jsonRequest('/stores/me', 'POST', { name: 'X', category: 'shoes' }, token);
    expect(res.status).toBe(400);
    const { fields } = await errorOf(res);
    expect(Object.keys(fields ?? {})).toEqual(
      expect.arrayContaining(['name', 'category', 'address', 'lat', 'lng', 'opensAt', 'closesAt']),
    );
  });
});

describe('GET /stores/me', () => {
  it('404s before setup and returns the store after', async () => {
    const { token } = await registerUser('store');
    expect((await jsonRequest('/stores/me', 'GET', undefined, token)).status).toBe(404);
    await jsonRequest('/stores/me', 'POST', profile, token);
    const res = await jsonRequest('/stores/me', 'GET', undefined, token);
    expect(res.status).toBe(200);
    expect(Store.parse(await res.json()).name).toBe(profile.name);
  });
});

describe('PATCH /stores/me', () => {
  it('updates only the given fields', async () => {
    const { token } = await registerUser('store');
    await jsonRequest('/stores/me', 'POST', profile, token);
    const res = await jsonRequest(
      '/stores/me',
      'PATCH',
      { name: 'Crumb Bakery', lat: 49.84 },
      token,
    );
    expect(res.status).toBe(200);
    expect(Store.parse(await res.json())).toMatchObject({
      ...profile,
      name: 'Crumb Bakery',
      lat: 49.84,
    });
  });

  it('re-validates the hours against the stored ones', async () => {
    const { token } = await registerUser('store');
    await jsonRequest('/stores/me', 'POST', profile, token);
    const res = await jsonRequest('/stores/me', 'PATCH', { opensAt: '21:00' }, token);
    expect(res.status).toBe(400);
    expect((await errorOf(res)).fields).toHaveProperty('closesAt');
  });

  it('404s when the owner has no shop yet', async () => {
    const { token } = await registerUser('store');
    expect((await jsonRequest('/stores/me', 'PATCH', { name: 'Nope' }, token)).status).toBe(404);
  });
});

describe('role guard', () => {
  it.each(['GET', 'POST', 'PATCH'])(
    '%s /stores/me 403s a customer and 401s without a token',
    async (method) => {
      const { token } = await registerUser('customer');
      const body = method === 'GET' ? undefined : profile;
      const res = await jsonRequest('/stores/me', method, body, token);
      expect(res.status).toBe(403);
      expect((await jsonRequest('/stores/me', method, body)).status).toBe(401);
    },
  );
});

describe('concurrent setup', () => {
  it('two simultaneous creates for one owner: one 201, one 409 store_exists (never 500)', async () => {
    const { token } = await registerUser('store');
    const results = await Promise.all([
      jsonRequest('/stores/me', 'POST', profile, token),
      jsonRequest('/stores/me', 'POST', profile, token),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
  });
});
