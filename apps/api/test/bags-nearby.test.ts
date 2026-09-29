import { ApiError, haversineKm, NearbyResponse } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertStore, north } from './helpers/fixtures';

const nearby = async (query: Record<string, string | number>, token: string) => {
  const qs = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]));
  return jsonRequest(`/bags/nearby?${qs}`, 'GET', undefined, token);
};
const bagsOf = async (res: Response) => NearbyResponse.parse(await res.json()).bags;

let token: string;
beforeEach(async () => {
  freezeClock('2026-09-29T14:00:00.000Z');
  ({ token } = await registerUser('customer'));
});
afterEach(() => resetClock());

describe('GET /bags/nearby', () => {
  it('returns bags within the radius, nearest first, measured from the query point', async () => {
    const here = freshCentre();
    const far = await insertBag(await insertStore(north(here, 1.4), { name: 'Kasha Kitchen' }));
    const near = await insertBag(await insertStore(north(here, 0.8), { name: 'Crumb' }));

    const res = await nearby({ ...here, radiusKm: 5 }, token);
    expect(res.status).toBe(200);
    const bags = await bagsOf(res);
    expect(bags.map((b) => b.id)).toEqual([near, far]);
    expect(bags[0]?.distanceKm).toBeCloseTo(0.8, 3);
    expect(bags[1]?.distanceKm).toBeCloseTo(1.4, 3);
    expect(bags[0]?.store).toMatchObject({ name: 'Crumb', timezone: 'Europe/Kyiv' });

    // From another point, distances follow the new point.
    const elsewhere = north(here, 1.4);
    const moved = await bagsOf(await nearby({ ...elsewhere, radiusKm: 5 }, token));
    expect(moved.map((b) => b.id)).toEqual([far, near]);
    expect(moved[0]?.distanceKm).toBeCloseTo(haversineKm(elsewhere, north(here, 1.4)), 6);
  });

  it('excludes a bag outside the radius', async () => {
    const here = freshCentre();
    await insertBag(await insertStore(north(here, 6)));
    const inside = await insertBag(await insertStore(north(here, 4.9)));
    const bags = await bagsOf(await nearby({ ...here, radiusKm: 5 }, token));
    expect(bags.map((b) => b.id)).toEqual([inside]);
  });

  it('excludes sold-out, paused and past-window bags', async () => {
    const here = freshCentre();
    const store = await insertStore(north(here, 1));
    await insertBag(store, { title: 'sold out', qtyAvailable: 0 });
    await insertBag(store, { title: 'paused', isActive: false });
    await insertBag(store, {
      title: 'over',
      pickupStart: '2026-09-29T12:00:00.000Z',
      pickupEnd: '2026-09-29T13:30:00.000Z',
    });
    const live = await insertBag(store, {
      title: 'running now',
      pickupStart: '2026-09-29T13:30:00.000Z',
      pickupEnd: '2026-09-29T14:30:00.000Z',
    });
    const bags = await bagsOf(await nearby({ ...here, radiusKm: 5 }, token));
    expect(bags.map((b) => b.id)).toEqual([live]);
  });

  it('filters by the bag’s category', async () => {
    const here = freshCentre();
    const store = await insertStore(north(here, 1), { category: 'cafe' });
    const bakery = await insertBag(store, { category: 'bakery' });
    await insertBag(store, { category: 'meals' });
    const bags = await bagsOf(await nearby({ ...here, radiusKm: 5, category: 'bakery' }, token));
    expect(bags.map((b) => b.id)).toEqual([bakery]);
  });

  it('401s without a token', async () => {
    const res = await jsonRequest('/bags/nearby?lat=49&lng=24&radiusKm=5', 'GET');
    expect(res.status).toBe(401);
  });

  it.each([
    ['missing lat', { lng: 24, radiusKm: 5 }, 'lat'],
    ['invalid lat', { lat: 91, lng: 24, radiusKm: 5 }, 'lat'],
    ['invalid lng', { lat: 49, lng: 'east', radiusKm: 5 }, 'lng'],
    ['radius too large', { lat: 49, lng: 24, radiusKm: 50 }, 'radiusKm'],
    ['unknown category', { lat: 49, lng: 24, radiusKm: 5, category: 'shoes' }, 'category'],
  ])('400s %s', async (_name, query, field) => {
    const res = await nearby(query, token);
    expect(res.status).toBe(400);
    expect(ApiError.parse(await res.json()).error.fields).toHaveProperty(field);
  });
});
