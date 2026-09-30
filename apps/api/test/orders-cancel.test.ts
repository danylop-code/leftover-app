import { env } from 'cloudflare:test';
import { OrderDetail } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertOrder, insertStore } from './helpers/fixtures';

const stockOf = async (bagId: string) =>
  (
    await env.DB.prepare('SELECT qty_available AS q FROM bags WHERE id = ?')
      .bind(bagId)
      .first<{ q: number }>()
  )?.q;

let token: string;
let userId: string;
beforeEach(async () => {
  freezeClock('2026-09-29T14:00:00.000Z');
  const session = await registerUser('customer');
  token = session.token;
  userId = session.user.id;
});
afterEach(() => resetClock());

const reserved = async (qtyAvailable = 1, qty = 2) => {
  const store = await insertStore(freshCentre());
  const bag = await insertBag(store, { qtyAvailable });
  const order = await insertOrder(userId, bag, store, { qty });
  return { store, bag, order };
};

describe('GET /orders/:id', () => {
  it('returns the order with its bag, shop and derived status', async () => {
    const { order, bag } = await reserved();
    const res = await jsonRequest(`/orders/${order}`, 'GET', undefined, token);
    expect(res.status).toBe(200);
    const body = OrderDetail.parse(await res.json());
    expect(body).toMatchObject({ id: order, bagId: bag, displayStatus: 'reserved', rating: null });
    expect(body.bag.title).toBe('Surprise bag');
  });

  it('404s another customer’s order, so its existence never leaks', async () => {
    const { order } = await reserved();
    const other = await registerUser('customer');
    expect((await jsonRequest(`/orders/${order}`, 'GET', undefined, other.token)).status).toBe(404);
  });

  it.each([
    ['2026-09-29T14:59:59.999Z', 'reserved'],
    ['2026-09-29T15:00:00.000Z', 'ready'],
    ['2026-09-29T16:29:59.999Z', 'ready'],
    ['2026-09-29T16:30:00.000Z', 'missed'],
  ])('at %s the status is %s', async (at, status) => {
    const { order } = await reserved();
    freezeClock(at);
    const body = OrderDetail.parse(
      await (await jsonRequest(`/orders/${order}`, 'GET', undefined, token)).json(),
    );
    expect(body.displayStatus).toBe(status);
  });
});

describe('POST /orders/:id/cancel', () => {
  it('cancels and puts the bags back exactly once, even when sent twice', async () => {
    const { order, bag } = await reserved(1, 2);
    const first = await jsonRequest(`/orders/${order}/cancel`, 'POST', undefined, token);
    expect(first.status).toBe(200);
    expect(OrderDetail.parse(await first.json())).toMatchObject({
      status: 'cancelled',
      displayStatus: 'cancelled',
    });
    const second = await jsonRequest(`/orders/${order}/cancel`, 'POST', undefined, token);
    expect(second.status).toBe(409);
    expect(await stockOf(bag)).toBe(3);
  });

  it('restocks once when two cancels race', async () => {
    const { order, bag } = await reserved(0, 1);
    const results = await Promise.all([
      jsonRequest(`/orders/${order}/cancel`, 'POST', undefined, token),
      jsonRequest(`/orders/${order}/cancel`, 'POST', undefined, token),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(await stockOf(bag)).toBe(1);
  });

  it.each([
    ['collected', { status: 'collected' as const, collectedAt: '2026-09-29T13:00:00.000Z' }],
    ['cancelled', { status: 'cancelled' as const, cancelledAt: '2026-09-29T13:00:00.000Z' }],
  ])('409s a %s order and leaves stock alone', async (_name, fields) => {
    const store = await insertStore(freshCentre());
    const bag = await insertBag(store, { qtyAvailable: 1 });
    const order = await insertOrder(userId, bag, store, fields);
    const res = await jsonRequest(`/orders/${order}/cancel`, 'POST', undefined, token);
    expect(res.status).toBe(409);
    expect(await stockOf(bag)).toBe(1);
  });

  it('409s once the pickup window has ended', async () => {
    const { order, bag } = await reserved(1, 1);
    freezeClock('2026-09-29T17:00:00.000Z');
    expect((await jsonRequest(`/orders/${order}/cancel`, 'POST', undefined, token)).status).toBe(
      409,
    );
    expect(await stockOf(bag)).toBe(1);
  });

  it('404s another customer’s order', async () => {
    const { order } = await reserved();
    const other = await registerUser('customer');
    expect(
      (await jsonRequest(`/orders/${order}/cancel`, 'POST', undefined, other.token)).status,
    ).toBe(404);
  });
});
