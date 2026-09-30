import { describe, expect, it } from 'vitest';
import { ApiError, Bag, IsoDateTime, MoneyMinor, Order, Store, User } from './index';

const iso = '2026-09-25T15:00:00.000Z';

const bag = {
  id: 'b1',
  storeId: 's1',
  title: 'Bakery surprise bag',
  description: 'Bread and pastries',
  category: 'bakery',
  priceMinor: 14900,
  originalPriceMinor: 45000,
  qtyTotal: 5,
  qtyAvailable: 3,
  pickupStart: iso,
  pickupEnd: '2026-09-25T16:30:00.000Z',
  isActive: true,
};

describe('MoneyMinor', () => {
  it('accepts integers ≥ 0', () => {
    expect(MoneyMinor.parse(0)).toBe(0);
    expect(MoneyMinor.parse(14900)).toBe(14900);
  });

  it('rejects floats and negatives', () => {
    expect(MoneyMinor.safeParse(149.5).success).toBe(false);
    expect(MoneyMinor.safeParse(-1).success).toBe(false);
  });
});

describe('IsoDateTime', () => {
  it('accepts UTC ISO-8601', () => {
    expect(IsoDateTime.safeParse(iso).success).toBe(true);
    expect(IsoDateTime.safeParse('2026-09-25T15:00:00Z').success).toBe(true);
  });

  it('rejects offsets, dates without time and junk', () => {
    expect(IsoDateTime.safeParse('2026-09-25T18:00:00+03:00').success).toBe(false);
    expect(IsoDateTime.safeParse('2026-09-25').success).toBe(false);
    expect(IsoDateTime.safeParse('tomorrow').success).toBe(false);
  });
});

describe('resource schemas', () => {
  it('parses a bag', () => {
    expect(Bag.parse(bag)).toEqual(bag);
  });

  it('rejects a bag with float money', () => {
    expect(Bag.safeParse({ ...bag, priceMinor: 149.0001 }).success).toBe(false);
  });

  it('parses a user and rejects unknown roles', () => {
    const user = {
      id: 'u1',
      email: 'olena@example.com',
      firstName: 'Olena',
      role: 'customer',
      createdAt: iso,
    };
    expect(User.parse(user)).toEqual(user);
    expect(User.safeParse({ ...user, role: 'admin' }).success).toBe(false);
  });

  it('never carries a password hash', () => {
    const parsed = User.parse({
      id: 'u1',
      email: 'olena@example.com',
      firstName: 'Olena',
      role: 'store',
      createdAt: iso,
      passwordHash: 'x',
    });
    expect(parsed).not.toHaveProperty('passwordHash');
  });

  it('parses a store with HH:mm hours and an IANA timezone', () => {
    const store = {
      id: 's1',
      name: 'Crumb & Co. Bakery',
      category: 'bakery',
      address: 'vul. Doroshenka 14',
      lat: 49.8397,
      lng: 24.0297,
      opensAt: '08:00',
      closesAt: '20:00',
      timezone: 'Europe/Kyiv',
    };
    expect(Store.parse(store)).toEqual(store);
    expect(Store.safeParse({ ...store, opensAt: '8:00' }).success).toBe(false);
    expect(Store.safeParse({ ...store, lat: 91 }).success).toBe(false);
  });

  it('parses an order with a 4-digit code and stored status', () => {
    const order = {
      id: 'o1',
      userId: 'u1',
      bagId: 'b1',
      storeId: 's1',
      qty: 1,
      unitPriceMinor: 14900,
      unitOriginalPriceMinor: 45000,
      code: '4827',
      status: 'reserved',
      createdAt: iso,
      collectedAt: null,
      cancelledAt: null,
    };
    expect(Order.parse(order)).toEqual(order);
    expect(Order.safeParse({ ...order, code: '482' }).success).toBe(false);
    expect(Order.safeParse({ ...order, status: 'ready' }).success).toBe(false);
  });
});

describe('ApiError', () => {
  it('parses the error envelope with optional per-field messages', () => {
    const body = {
      error: { code: 'validation', message: 'Invalid body', fields: { qty: ['Too big'] } },
    };
    expect(ApiError.parse(body)).toEqual(body);
    expect(ApiError.parse({ error: { code: 'not_found', message: 'Not found' } })).toBeTruthy();
  });
});
