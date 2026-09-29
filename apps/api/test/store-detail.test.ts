import { ApiError, StoreDetail } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertStore, north } from './helpers/fixtures';

const detail = (id: string, at: { lat: number; lng: number }, token?: string) =>
  jsonRequest(`/stores/${id}?lat=${at.lat}&lng=${at.lng}`, 'GET', undefined, token);

let token: string;
beforeEach(async () => {
  // 17:00 in Kyiv: fixture shops are open 08:00–20:00.
  freezeClock('2026-09-29T14:00:00.000Z');
  ({ token } = await registerUser('customer'));
});
afterEach(() => resetClock());

describe('GET /stores/:id', () => {
  it('returns the shop, its distance from the query point and today’s bags with counts', async () => {
    const here = freshCentre();
    const store = await insertStore(north(here, 0.8), { name: 'Crumb & Co. Bakery' });
    const late = await insertBag(store, {
      title: 'Sweet box',
      pickupStart: '2026-09-29T15:30:00.000Z',
      pickupEnd: '2026-09-29T16:30:00.000Z',
    });
    const early = await insertBag(store, { title: 'Bakery surprise bag' });
    const soldOut = await insertBag(store, { title: 'Bread-only bag', qtyAvailable: 0 });
    await insertBag(store, { title: 'paused', isActive: false });
    await insertBag(store, {
      title: 'over',
      pickupStart: '2026-09-29T11:00:00.000Z',
      pickupEnd: '2026-09-29T12:00:00.000Z',
    });
    await insertBag(await insertStore(north(here, 0.9)), { title: 'another shop' });

    const res = await detail(store, here, token);
    expect(res.status).toBe(200);
    const body = StoreDetail.parse(await res.json());
    expect(body.store).toMatchObject({ id: store, name: 'Crumb & Co. Bakery', opensAt: '08:00' });
    expect(body.distanceKm).toBeCloseTo(0.8, 3);
    expect(body.openStatus).toBe('open');
    expect(body.bags.map((b) => b.id)).toEqual([early, late, soldOut]);
    expect(body.counts).toEqual({ available: 2, total: 3 });
    expect(body.rating).toBeNull();
  });

  it('measures the distance from wherever the customer is looking', async () => {
    const here = freshCentre();
    const store = await insertStore(north(here, 3));
    const body = StoreDetail.parse(await (await detail(store, north(here, 1), token)).json());
    expect(body.distanceKm).toBeCloseTo(2, 3);
  });

  it('says the shop is closed outside its hours in its own timezone', async () => {
    const here = freshCentre();
    const store = await insertStore(north(here, 1));
    freezeClock('2026-09-29T18:00:00.000Z'); // 21:00 in Kyiv
    expect(StoreDetail.parse(await (await detail(store, here, token)).json()).openStatus).toBe(
      'afterClosing',
    );
    freezeClock('2026-09-29T03:00:00.000Z'); // 06:00 in Kyiv
    expect(StoreDetail.parse(await (await detail(store, here, token)).json()).openStatus).toBe(
      'beforeOpening',
    );
  });

  it('404s an unknown shop', async () => {
    const res = await detail('no-such-store', freshCentre(), token);
    expect(res.status).toBe(404);
    expect(ApiError.parse(await res.json()).error.code).toBe('not_found');
  });

  it('401s without a token and 400s without the location', async () => {
    const store = await insertStore(freshCentre());
    expect((await detail(store, freshCentre())).status).toBe(401);
    const res = await jsonRequest(`/stores/${store}?lat=49.8`, 'GET', undefined, token);
    expect(res.status).toBe(400);
    expect(ApiError.parse(await res.json()).error.fields).toHaveProperty('lng');
  });

  it('leaves /stores/me to shop owners', async () => {
    const res = await jsonRequest('/stores/me', 'GET', undefined, token);
    expect(res.status).toBe(403);
  });
});
