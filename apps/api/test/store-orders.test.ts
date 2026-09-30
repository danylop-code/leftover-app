import { ApiError, StoreOrder, StoreOrdersToday } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { freezeClock, resetClock } from '../src/lib/clock';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertOrder, shopOwner } from './helpers/fixtures';

let owner: Awaited<ReturnType<typeof shopOwner>>;
let customer: Awaited<ReturnType<typeof registerUser>>;
beforeEach(async () => {
  // 17:00 in Kyiv on 29 Sep.
  freezeClock('2026-09-29T14:00:00.000Z');
  owner = await shopOwner(freshCentre());
  customer = await registerUser('customer');
});
afterEach(() => resetClock());

const today = async (token = owner.token) =>
  StoreOrdersToday.parse(
    await (await jsonRequest('/store/orders/today', 'GET', undefined, token)).json(),
  );
const confirm = (code: unknown, token = owner.token) =>
  jsonRequest('/store/orders/confirm', 'POST', { code }, token);

describe('shop orders', () => {
  it('confirms today’s code: collected, with what to hand over and charge', async () => {
    const bag = await insertBag(owner.storeId, { title: 'Bakery surprise bag' });
    await insertOrder(customer.user.id, bag, owner.storeId, { code: '4827', qty: 2 });
    const res = await confirm('4827');
    expect(res.status).toBe(200);
    expect(StoreOrder.parse(await res.json())).toMatchObject({
      code: '4827',
      customerName: 'Olena',
      qty: 2,
      bagTitle: 'Bakery surprise bag',
      totalMinor: 29800,
      displayStatus: 'collected',
      collectedAt: '2026-09-29T14:00:00.000Z',
    });

    const customerView = await jsonRequest(
      '/orders/me?scope=past',
      'GET',
      undefined,
      customer.token,
    );
    expect(
      ((await customerView.json()) as { orders: { displayStatus: string }[] }).orders[0]
        ?.displayStatus,
    ).toBe('collected');
  });

  it('404s the same code a second time (no double collection)', async () => {
    const bag = await insertBag(owner.storeId);
    await insertOrder(customer.user.id, bag, owner.storeId, { code: '1111' });
    expect((await confirm('1111')).status).toBe(200);
    const again = await confirm('1111');
    expect(again.status).toBe(404);
    expect(ApiError.parse(await again.json()).error.code).toBe('code_not_found');
  });

  it('404s a code from another shop', async () => {
    const other = await shopOwner(freshCentre());
    const bag = await insertBag(other.storeId);
    await insertOrder(customer.user.id, bag, other.storeId, { code: '2222' });
    expect((await confirm('2222')).status).toBe(404);
  });

  it('404s a code whose window was another day, or is already over', async () => {
    const yesterday = await insertBag(owner.storeId, {
      pickupStart: '2026-09-28T15:00:00.000Z',
      pickupEnd: '2026-09-28T16:00:00.000Z',
    });
    await insertOrder(customer.user.id, yesterday, owner.storeId, { code: '3333' });
    const over = await insertBag(owner.storeId, {
      pickupStart: '2026-09-29T10:00:00.000Z',
      pickupEnd: '2026-09-29T11:00:00.000Z',
    });
    await insertOrder(customer.user.id, over, owner.storeId, { code: '4444' });
    expect((await confirm('3333')).status).toBe(404);
    expect((await confirm('4444')).status).toBe(404);
  });

  it.each(['482', '48271', 'abcd', 4827])('400s the code %p', async (code) => {
    expect((await confirm(code)).status).toBe(400);
  });

  it('lists today in the shop’s timezone: to collect first, then collected', async () => {
    const early = await insertBag(owner.storeId, {
      title: 'Early bag',
      pickupStart: '2026-09-29T13:00:00.000Z',
      pickupEnd: '2026-09-29T15:00:00.000Z',
    });
    const late = await insertBag(owner.storeId, { title: 'Late bag' });
    // 00:30 on 30 Sep in Kyiv is still 29 Sep in UTC: it belongs to tomorrow's list.
    const tomorrow = await insertBag(owner.storeId, {
      title: 'Tomorrow bag',
      pickupStart: '2026-09-29T21:30:00.000Z',
      pickupEnd: '2026-09-29T22:30:00.000Z',
    });
    await insertOrder(customer.user.id, late, owner.storeId, { code: '1000' });
    await insertOrder(customer.user.id, early, owner.storeId, { code: '2000' });
    await insertOrder(customer.user.id, tomorrow, owner.storeId, { code: '3000' });
    await insertOrder(customer.user.id, late, owner.storeId, { code: '5000', status: 'cancelled' });
    await confirm('1000');

    const list = await today();
    expect(list.orders.map((o) => [o.bagTitle, o.displayStatus])).toEqual([
      ['Early bag', 'ready'],
      ['Late bag', 'collected'],
    ]);
    expect(list.counts).toEqual({ toCollect: 1, total: 2 });
  });

  it('403s a customer', async () => {
    expect(
      (await jsonRequest('/store/orders/today', 'GET', undefined, customer.token)).status,
    ).toBe(403);
    expect((await confirm('1234', customer.token)).status).toBe(403);
  });
});
