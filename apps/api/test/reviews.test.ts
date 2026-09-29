import { ApiError, MyOrdersResponse, NearbyResponse, StoreDetail } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertOrder, insertStore } from './helpers/fixtures';

let token: string;
let userId: string;
let here: { lat: number; lng: number };
let store: string;
beforeEach(async () => {
  freezeClock('2026-09-29T14:00:00.000Z');
  const session = await registerUser('customer');
  token = session.token;
  userId = session.user.id;
  here = freshCentre();
  store = await insertStore(here);
});
afterEach(() => resetClock());

const collected = async (user = userId) =>
  insertOrder(user, await insertBag(store), store, {
    status: 'collected',
    collectedAt: '2026-09-29T13:00:00.000Z',
  });
const review = (order: string, body: unknown, as = token) =>
  jsonRequest(`/orders/${order}/review`, 'POST', body, as);
const detail = async () =>
  StoreDetail.parse(
    await (
      await jsonRequest(`/stores/${store}?lat=${here.lat}&lng=${here.lng}`, 'GET', undefined, token)
    ).json(),
  );

describe('reviews', () => {
  it('reviews a collected order; the order then shows the rating', async () => {
    const order = await collected();
    const res = await review(order, { overall: 4, text: 'Tasty.' });
    expect(res.status).toBe(201);
    const past = MyOrdersResponse.parse(
      await (await jsonRequest('/orders/me?scope=past', 'GET', undefined, token)).json(),
    );
    expect(past.orders.find((o) => o.id === order)?.rating).toBe(4);
  });

  it.each([
    ['reserved', {}],
    ['cancelled', { status: 'cancelled' as const, cancelledAt: '2026-09-29T12:00:00.000Z' }],
  ])('409s not_collected for a %s order', async (_name, fields) => {
    const order = await insertOrder(userId, await insertBag(store), store, fields);
    const res = await review(order, { overall: 5 });
    expect(res.status).toBe(409);
    expect(ApiError.parse(await res.json()).error.code).toBe('not_collected');
  });

  it('409s already_reviewed on a second review', async () => {
    const order = await collected();
    await review(order, { overall: 5 });
    const again = await review(order, { overall: 3 });
    expect(again.status).toBe(409);
    expect(ApiError.parse(await again.json()).error.code).toBe('already_reviewed');
  });

  it.each([
    ['text over 500 characters', { overall: 4, text: 'x'.repeat(501) }],
    ['no overall rating', { text: 'Nice' }],
    ['an overall of 6', { overall: 6 }],
  ])('400s %s', async (_name, body) => {
    expect((await review(await collected(), body)).status).toBe(400);
  });

  it('404s someone else’s order', async () => {
    const other = await registerUser('customer');
    const order = await collected(other.user.id);
    expect((await review(order, { overall: 5 })).status).toBe(404);
  });

  it('averages 5, 4, 5 to 4.7 over 3 ratings; unanswered aspects don’t count', async () => {
    const others = await Promise.all([registerUser('customer'), registerUser('customer')]);
    await review(await collected(), { overall: 5, quality: 5 });
    await review(await collected(others[0].user.id), { overall: 4, quality: 3 }, others[0].token);
    await review(
      await collected(others[1].user.id),
      { overall: 5, text: 'Great' },
      others[1].token,
    );

    const shop = await detail();
    expect(shop.rating).toEqual({
      average: 4.7,
      count: 3,
      aspects: { quality: 4, variety: null, freshness: null, ease: null },
    });
    expect(shop.recentReviews).toHaveLength(3);
    expect(shop.recentReviews[0]).toMatchObject({ authorName: 'Olena' });

    await insertBag(store);
    const customer = await registerUser('customer');
    const nearby = NearbyResponse.parse(
      await (
        await jsonRequest(
          `/bags/nearby?lat=${here.lat}&lng=${here.lng}&radiusKm=5`,
          'GET',
          undefined,
          customer.token,
        )
      ).json(),
    );
    expect(nearby.bags[0]?.rating).toEqual({ average: 4.7, count: 3 });
  });

  it('shows no rating anywhere for a shop without reviews', async () => {
    await insertBag(store);
    const shop = await detail();
    expect(shop.rating).toBeNull();
    expect(shop.recentReviews).toEqual([]);
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
    expect(nearby.bags[0]?.rating).toBeNull();
  });
});
