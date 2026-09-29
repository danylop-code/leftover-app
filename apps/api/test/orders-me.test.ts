import { MyOrdersResponse } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertOrder, insertStore } from './helpers/fixtures';

const mine = async (scope: 'current' | 'past', token: string) => {
  const res = await jsonRequest(`/orders/me?scope=${scope}`, 'GET', undefined, token);
  expect(res.status).toBe(200);
  return MyOrdersResponse.parse(await res.json());
};

let token: string;
let userId: string;
beforeEach(async () => {
  // 17:30 in Kyiv.
  freezeClock('2026-09-29T14:30:00.000Z');
  const session = await registerUser('customer');
  token = session.token;
  userId = session.user.id;
});
afterEach(() => resetClock());

const bagWindow = (start: string, end: string) => ({ pickupStart: start, pickupEnd: end });

describe('GET /orders/me', () => {
  it('splits current (ready or upcoming, soonest first) from past (newest first)', async () => {
    const store = await insertStore(freshCentre());
    const ready = await insertOrder(
      userId,
      await insertBag(store, bagWindow('2026-09-29T14:00:00.000Z', '2026-09-29T15:00:00.000Z')),
      store,
    );
    const later = await insertOrder(
      userId,
      await insertBag(store, bagWindow('2026-09-30T09:00:00.000Z', '2026-09-30T10:00:00.000Z')),
      store,
    );
    const missed = await insertOrder(
      userId,
      await insertBag(store, bagWindow('2026-09-29T10:00:00.000Z', '2026-09-29T11:00:00.000Z')),
      store,
    );
    const cancelled = await insertOrder(
      userId,
      await insertBag(store, bagWindow('2026-09-29T12:00:00.000Z', '2026-09-29T13:00:00.000Z')),
      store,
      { status: 'cancelled', cancelledAt: '2026-09-29T11:40:00.000Z' },
    );

    const current = await mine('current', token);
    expect(current.orders.map((o) => [o.id, o.displayStatus])).toEqual([
      [ready, 'ready'],
      [later, 'reserved'],
    ]);
    expect(current.currentCount).toBe(2);

    const past = await mine('past', token);
    expect(past.orders.map((o) => [o.id, o.displayStatus])).toEqual([
      [cancelled, 'cancelled'],
      [missed, 'missed'],
    ]);
    expect(past.orders[0]?.cancelledAt).toBe('2026-09-29T11:40:00.000Z');
    expect(past.currentCount).toBe(2);
  });

  it('never shows another customer’s orders', async () => {
    const store = await insertStore(freshCentre());
    const other = await registerUser('customer');
    await insertOrder(other.user.id, await insertBag(store), store);
    expect((await mine('current', token)).orders).toEqual([]);
    expect((await mine('current', other.token)).orders).toHaveLength(1);
  });

  it('leaves out past orders older than 60 days', async () => {
    const store = await insertStore(freshCentre());
    await insertOrder(
      userId,
      await insertBag(store, bagWindow('2026-07-01T10:00:00.000Z', '2026-07-01T11:00:00.000Z')),
      store,
      { status: 'collected', collectedAt: '2026-07-01T10:30:00.000Z' },
    );
    expect((await mine('past', token)).orders).toEqual([]);
  });

  it('400s an unknown scope and 403s a shop owner', async () => {
    expect((await jsonRequest('/orders/me?scope=all', 'GET', undefined, token)).status).toBe(400);
    const owner = await registerUser('store');
    expect(
      (await jsonRequest('/orders/me?scope=current', 'GET', undefined, owner.token)).status,
    ).toBe(403);
  });
});
