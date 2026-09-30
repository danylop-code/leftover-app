import { NearbyResponse, ShopBag, ShopBagsResponse } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertOrder, shopOwner } from './helpers/fixtures';

// 17:00 in Kyiv; windows below are later today (Kyiv is UTC+3 in September).
const NOW = '2026-09-29T14:00:00.000Z';
const body = {
  title: 'Bakery surprise bag',
  description: 'Bread and pastries.',
  category: 'bakery',
  originalPriceMinor: 45000,
  priceMinor: 14900,
  qtyTotal: 5,
  pickupStart: '2026-09-29T15:00:00.000Z',
  pickupEnd: '2026-09-29T16:30:00.000Z',
  isActive: true,
};

const raw = async (res: Response) =>
  (
    (await res.json()) as {
      error: { code: string; fields?: Record<string, string[]> } & Record<string, unknown>;
    }
  ).error;

let owner: Awaited<ReturnType<typeof shopOwner>>;
let here: { lat: number; lng: number };
beforeEach(async () => {
  freezeClock(NOW);
  here = freshCentre();
  owner = await shopOwner(here);
});
afterEach(() => resetClock());

const create = async (overrides: Record<string, unknown> = {}) =>
  jsonRequest('/store/bags', 'POST', { ...body, ...overrides }, owner.token);
const created = async (overrides: Record<string, unknown> = {}) => {
  const res = await create(overrides);
  expect(res.status).toBe(201);
  return ShopBag.parse(await res.json());
};
const list = async () =>
  ShopBagsResponse.parse(
    await (await jsonRequest('/store/bags', 'GET', undefined, owner.token)).json(),
  );
const nearbyIds = async () => {
  const customer = await registerUser('customer');
  const res = await jsonRequest(
    `/bags/nearby?lat=${here.lat}&lng=${here.lng}&radiusKm=5`,
    'GET',
    undefined,
    customer.token,
  );
  return NearbyResponse.parse(await res.json()).bags.map((b) => b.id);
};

describe('shop bags', () => {
  it('a new bag is live in My bags and shows on Discover nearby', async () => {
    const bag = await created();
    expect(bag).toMatchObject({ qtyAvailable: 5, isActive: true, reservedCount: 0 });
    const mine = await list();
    expect(mine.bags.map((b) => b.id)).toEqual([bag.id]);
    expect(mine.storeName).toBe('Owner’s shop');
    expect(await nearbyIds()).toContain(bag.id);
  });

  it('400s a sale price at or above the original', async () => {
    const res = await create({ priceMinor: 45000 });
    expect(res.status).toBe(400);
    expect((await raw(res)).fields).toHaveProperty('priceMinor');
  });

  it.each([
    ['shorter than 30 minutes', { pickupEnd: '2026-09-29T15:29:00.000Z' }, 'pickupEnd'],
    [
      'already over',
      { pickupStart: '2026-09-29T12:00:00.000Z', pickupEnd: '2026-09-29T13:00:00.000Z' },
      'pickupEnd',
    ],
    [
      'not today in the shop’s timezone',
      { pickupStart: '2026-09-30T15:00:00.000Z', pickupEnd: '2026-09-30T16:00:00.000Z' },
      'pickupStart',
    ],
  ])('400s a window %s', async (_name, window, field) => {
    const res = await create(window);
    expect(res.status).toBe(400);
    expect((await raw(res)).fields).toHaveProperty(field);
  });

  it('refuses to go below what is already reserved, and raising the total adds availability', async () => {
    const bag = await created();
    const customer = await registerUser('customer');
    for (let i = 0; i < 3; i++) {
      expect(
        (await jsonRequest('/orders', 'POST', { bagId: bag.id, qty: 1 }, customer.token)).status,
      ).toBe(201);
    }
    const below = await jsonRequest(`/store/bags/${bag.id}`, 'PATCH', { qtyTotal: 2 }, owner.token);
    expect(below.status).toBe(409);
    expect(await raw(below)).toMatchObject({ code: 'below_reserved', reservedCount: 3 });

    const up = await jsonRequest(`/store/bags/${bag.id}`, 'PATCH', { qtyTotal: 6 }, owner.token);
    expect(up.status).toBe(200);
    expect(ShopBag.parse(await up.json())).toMatchObject({
      qtyTotal: 6,
      qtyAvailable: 3,
      reservedCount: 3,
    });
  });

  it('pausing hides the bag from Discover; resuming brings it back', async () => {
    const bag = await created();
    await jsonRequest(`/store/bags/${bag.id}`, 'PATCH', { isActive: false }, owner.token);
    expect(await nearbyIds()).not.toContain(bag.id);
    expect((await list()).bags[0]?.isActive).toBe(false);
    await jsonRequest(`/store/bags/${bag.id}`, 'PATCH', { isActive: true }, owner.token);
    expect(await nearbyIds()).toContain(bag.id);
  });

  it('won’t delete a bag with reservations, but deletes one nobody ordered', async () => {
    const reservedBag = await created();
    const customer = await registerUser('customer');
    await jsonRequest('/orders', 'POST', { bagId: reservedBag.id, qty: 1 }, customer.token);
    const refused = await jsonRequest(
      `/store/bags/${reservedBag.id}`,
      'DELETE',
      undefined,
      owner.token,
    );
    expect(refused.status).toBe(409);
    expect((await raw(refused)).code).toBe('has_reservations');

    const spare = await created({ title: 'Spare bag' });
    expect(
      (await jsonRequest(`/store/bags/${spare.id}`, 'DELETE', undefined, owner.token)).status,
    ).toBe(204);
    expect((await list()).bags.map((b) => b.id)).toEqual([reservedBag.id]);
  });

  it('404s another shop’s bag', async () => {
    const bag = await created();
    const other = await shopOwner(freshCentre());
    expect(
      (await jsonRequest(`/store/bags/${bag.id}`, 'PATCH', { title: 'Mine now' }, other.token))
        .status,
    ).toBe(404);
    expect(
      (await jsonRequest(`/store/bags/${bag.id}`, 'DELETE', undefined, other.token)).status,
    ).toBe(404);
  });

  it('counts live bags and bags reserved today', async () => {
    const live = await created();
    const paused = await created({ title: 'Paused bag', isActive: false });
    const soldOut = await created({ title: 'Last one', qtyTotal: 1 });
    const customer = await registerUser('customer');
    await jsonRequest('/orders', 'POST', { bagId: live.id, qty: 2 }, customer.token);
    await jsonRequest('/orders', 'POST', { bagId: soldOut.id, qty: 1 }, customer.token);
    // A cancelled order doesn't count.
    await insertOrder(customer.user.id, live.id, owner.storeId, { status: 'cancelled', qty: 4 });
    const { stats } = await list();
    expect(stats).toEqual({ liveNow: 1, reservedToday: 3 });
    expect(paused.isActive).toBe(false);
  });

  it('403s a customer', async () => {
    const customer = await registerUser('customer');
    expect((await jsonRequest('/store/bags', 'GET', undefined, customer.token)).status).toBe(403);
  });
});
