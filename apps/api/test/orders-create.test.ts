import { env } from 'cloudflare:test';
import { ApiError, Order } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertStore } from './helpers/fixtures';

const reserve = (body: unknown, token?: string) => jsonRequest('/orders', 'POST', body, token);
// Raw envelope: ApiError's schema would drop extra keys such as `qtyAvailable`.
const errorOf = async (res: Response) => {
  const body = (await res.json()) as { error: Record<string, unknown> };
  ApiError.parse(body);
  return body.error as { code: string; fields?: Record<string, string[]> } & Record<
    string,
    unknown
  >;
};

const stockOf = async (bagId: string) =>
  (
    await env.DB.prepare('SELECT qty_available AS q FROM bags WHERE id = ?')
      .bind(bagId)
      .first<{ q: number }>()
  )?.q;
const ordersFor = async (bagId: string) =>
  (
    await env.DB.prepare('SELECT COUNT(*) AS n FROM orders WHERE bag_id = ?')
      .bind(bagId)
      .first<{ n: number }>()
  )?.n;

let token: string;
beforeEach(async () => {
  freezeClock('2026-09-29T14:00:00.000Z');
  ({ token } = await registerUser('customer'));
});
afterEach(() => resetClock());

describe('POST /orders', () => {
  it('reserves: 201 with a 4-digit code, price snapshots, and one less in stock', async () => {
    const store = await insertStore(freshCentre());
    const bag = await insertBag(store, { qtyAvailable: 3 });
    const res = await reserve({ bagId: bag, qty: 1 }, token);
    expect(res.status).toBe(201);
    const order = Order.parse(await res.json());
    expect(order).toMatchObject({
      bagId: bag,
      storeId: store,
      qty: 1,
      unitPriceMinor: 14900,
      unitOriginalPriceMinor: 45000,
      status: 'reserved',
      collectedAt: null,
      cancelledAt: null,
    });
    expect(order.code).toMatch(/^\d{4}$/);
    expect(await stockOf(bag)).toBe(2);
  });

  it('takes several bags at once', async () => {
    const bag = await insertBag(await insertStore(freshCentre()), { qtyAvailable: 3 });
    expect((await reserve({ bagId: bag, qty: 3 }, token)).status).toBe(201);
    expect(await stockOf(bag)).toBe(0);
  });

  it('sells the last bag exactly once when two customers race for it', async () => {
    const bag = await insertBag(await insertStore(freshCentre()), { qtyAvailable: 1 });
    const other = await registerUser('customer');
    const results = await Promise.all([
      reserve({ bagId: bag, qty: 1 }, token),
      reserve({ bagId: bag, qty: 1 }, other.token),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    const loser = results.find((r) => r.status === 409);
    expect(await errorOf(loser as Response)).toMatchObject({ code: 'sold_out', qtyAvailable: 0 });
    expect(await stockOf(bag)).toBe(0);
    expect(await ordersFor(bag)).toBe(1);
  });

  it('409s sold_out with the available count when asking for more than is left, writing nothing', async () => {
    const bag = await insertBag(await insertStore(freshCentre()), { qtyAvailable: 2 });
    const res = await reserve({ bagId: bag, qty: 3 }, token);
    expect(res.status).toBe(409);
    expect(await errorOf(res)).toMatchObject({ code: 'sold_out', qtyAvailable: 2 });
    expect(await stockOf(bag)).toBe(2);
    expect(await ordersFor(bag)).toBe(0);
  });

  it.each([0, 6, 1.5])('400s qty %p', async (qty) => {
    const bag = await insertBag(await insertStore(freshCentre()));
    const res = await reserve({ bagId: bag, qty }, token);
    expect(res.status).toBe(400);
    expect((await errorOf(res)).fields).toHaveProperty('qty');
  });

  it.each([
    ['paused', { isActive: false }],
    [
      'past its pickup window',
      { pickupStart: '2026-09-29T12:00:00.000Z', pickupEnd: '2026-09-29T13:00:00.000Z' },
    ],
  ])('409s not_available for a bag that is %s', async (_name, fields) => {
    const bag = await insertBag(await insertStore(freshCentre()), fields);
    const res = await reserve({ bagId: bag, qty: 1 }, token);
    expect(res.status).toBe(409);
    expect((await errorOf(res)).code).toBe('not_available');
    expect(await ordersFor(bag)).toBe(0);
  });

  it('404s an unknown bag', async () => {
    const res = await reserve({ bagId: 'no-such-bag', qty: 1 }, token);
    expect(res.status).toBe(404);
  });

  it('403s a shop owner and 401s without a token', async () => {
    const bag = await insertBag(await insertStore(freshCentre()));
    const owner = await registerUser('store');
    expect((await reserve({ bagId: bag, qty: 1 }, owner.token)).status).toBe(403);
    expect((await reserve({ bagId: bag, qty: 1 })).status).toBe(401);
  });

  it('never repeats a code among the shop’s open reservations', async () => {
    const bag = await insertBag(await insertStore(freshCentre()), { qtyAvailable: 5 });
    const codes: string[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await reserve({ bagId: bag, qty: 1 }, token);
      codes.push(Order.parse(await res.json()).code);
    }
    expect(new Set(codes).size).toBe(5);
  });
});
