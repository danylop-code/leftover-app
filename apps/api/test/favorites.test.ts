import { env } from 'cloudflare:test';
import { NearbyResponse, StoreDetail } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertStore } from './helpers/fixtures';

let token: string;
let userId: string;
let here: { lat: number; lng: number };
let store: string;
beforeEach(async () => {
  freezeClock('2026-09-29T14:00:00.000Z');
  ({
    token,
    user: { id: userId },
  } = await registerUser('customer'));
  here = freshCentre();
  store = await insertStore(here);
  await insertBag(store);
  await insertBag(store, { title: 'Second bag' });
});
afterEach(() => resetClock());

const rows = async () =>
  (
    await env.DB.prepare('SELECT COUNT(*) AS n FROM favorites WHERE user_id = ? AND store_id = ?')
      .bind(userId, store)
      .first<{ n: number }>()
  )?.n;
const nearby = async (as = token) =>
  NearbyResponse.parse(
    await (
      await jsonRequest(
        `/bags/nearby?lat=${here.lat}&lng=${here.lng}&radiusKm=5`,
        'GET',
        undefined,
        as,
      )
    ).json(),
  ).bags;

describe('favorites', () => {
  it('saving twice is fine: 204 both times, one row', async () => {
    expect((await jsonRequest(`/favorites/${store}`, 'PUT', undefined, token)).status).toBe(204);
    expect((await jsonRequest(`/favorites/${store}`, 'PUT', undefined, token)).status).toBe(204);
    expect(await rows()).toBe(1);
  });

  it('marks every bag of a saved shop on Discover, and the shop page', async () => {
    await jsonRequest(`/favorites/${store}`, 'PUT', undefined, token);
    expect((await nearby()).map((b) => b.isFavorite)).toEqual([true, true]);
    const shop = StoreDetail.parse(
      await (
        await jsonRequest(
          `/stores/${store}?lat=${here.lat}&lng=${here.lng}`,
          'GET',
          undefined,
          token,
        )
      ).json(),
    );
    expect(shop.isFavorite).toBe(true);
  });

  it('is per customer', async () => {
    await jsonRequest(`/favorites/${store}`, 'PUT', undefined, token);
    const other = await registerUser('customer');
    expect((await nearby(other.token)).every((b) => !b.isFavorite)).toBe(true);
  });

  it('unsaving (even twice) clears it', async () => {
    await jsonRequest(`/favorites/${store}`, 'PUT', undefined, token);
    expect((await jsonRequest(`/favorites/${store}`, 'DELETE', undefined, token)).status).toBe(204);
    expect((await jsonRequest(`/favorites/${store}`, 'DELETE', undefined, token)).status).toBe(204);
    expect(await rows()).toBe(0);
    expect((await nearby()).every((b) => !b.isFavorite)).toBe(true);
  });

  it('404s an unknown shop and 403s a shop owner', async () => {
    expect((await jsonRequest('/favorites/no-such-store', 'PUT', undefined, token)).status).toBe(
      404,
    );
    const owner = await registerUser('store');
    expect((await jsonRequest(`/favorites/${store}`, 'PUT', undefined, owner.token)).status).toBe(
      403,
    );
  });
});
