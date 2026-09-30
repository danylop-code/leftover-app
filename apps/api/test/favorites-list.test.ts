import { SavedShopsResponse } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertStore, north } from './helpers/fixtures';

let token: string;
let here: { lat: number; lng: number };
beforeEach(async () => {
  freezeClock('2026-09-29T14:00:00.000Z');
  ({ token } = await registerUser('customer'));
  here = freshCentre();
});
afterEach(() => resetClock());

const list = async (as = token) =>
  SavedShopsResponse.parse(
    await (
      await jsonRequest(`/favorites?lat=${here.lat}&lng=${here.lng}`, 'GET', undefined, as)
    ).json(),
  ).shops;

describe('GET /favorites', () => {
  it('lists saved shops nearest first, with the bags they still offer', async () => {
    const far = await insertStore(north(here, 3), { name: 'Far shop' });
    const near = await insertStore(north(here, 1), { name: 'Near shop', category: 'cafe' });
    await insertBag(near);
    await insertBag(near, { qtyAvailable: 0 });
    await insertBag(near, { isActive: false });
    await jsonRequest(`/favorites/${far}`, 'PUT', undefined, token);
    await jsonRequest(`/favorites/${near}`, 'PUT', undefined, token);

    const shops = await list();
    expect(shops.map((s) => [s.store.name, s.bagsAvailable])).toEqual([
      ['Near shop', 1],
      ['Far shop', 0],
    ]);
    expect(shops[0]?.distanceKm).toBeCloseTo(1, 3);
    expect(shops[0]?.store.category).toBe('cafe');
    expect(shops[0]?.rating).toBeNull();
  });

  it('is empty without saves, per customer, and 403s shops', async () => {
    const store = await insertStore(north(here, 1));
    const other = await registerUser('customer');
    await jsonRequest(`/favorites/${store}`, 'PUT', undefined, other.token);
    expect(await list()).toEqual([]);
    expect(await list(other.token)).toHaveLength(1);
    const owner = await registerUser('store');
    expect(
      (
        await jsonRequest(
          `/favorites?lat=${here.lat}&lng=${here.lng}`,
          'GET',
          undefined,
          owner.token,
        )
      ).status,
    ).toBe(403);
  });

  it('400s without the location', async () => {
    expect((await jsonRequest('/favorites', 'GET', undefined, token)).status).toBe(400);
  });
});
