import { Me, MeStats } from '@leftover/shared';
import { describe, expect, it } from 'vitest';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertOrder, insertStore } from './helpers/fixtures';

const collected = { status: 'collected' as const, collectedAt: '2026-09-29T13:00:00.000Z' };

describe('GET /me/stats', () => {
  it('sums bags and savings from collected orders only, in kopiyky', async () => {
    const { token, user } = await registerUser('customer');
    const store = await insertStore(freshCentre());
    const bag = await insertBag(store);
    // Savings: ₴301, ₴211 and 2 × ₴100 = ₴712 over 4 bags.
    await insertOrder(user.id, bag, store, {
      ...collected,
      unitPriceMinor: 14900,
      unitOriginalPriceMinor: 45000,
    });
    await insertOrder(user.id, bag, store, {
      ...collected,
      unitPriceMinor: 8900,
      unitOriginalPriceMinor: 30000,
    });
    await insertOrder(user.id, bag, store, {
      ...collected,
      qty: 2,
      unitPriceMinor: 5000,
      unitOriginalPriceMinor: 15000,
    });
    await insertOrder(user.id, bag, store, { status: 'cancelled', qty: 3 });
    await insertOrder(user.id, bag, store, { qty: 1 });

    const res = await jsonRequest('/me/stats', 'GET', undefined, token);
    expect(res.status).toBe(200);
    expect(MeStats.parse(await res.json())).toEqual({ bagsRescued: 4, savedMinor: 71200 });
  });

  it('403s a shop owner', async () => {
    const owner = await registerUser('store');
    expect((await jsonRequest('/me/stats', 'GET', undefined, owner.token)).status).toBe(403);
  });
});

describe('PATCH /me', () => {
  it('renames the user', async () => {
    const { token } = await registerUser('customer');
    const res = await jsonRequest('/me', 'PATCH', { firstName: '  Olha ' }, token);
    expect(res.status).toBe(200);
    expect(Me.parse(await res.json()).firstName).toBe('Olha');
    expect(
      Me.parse(await (await jsonRequest('/me', 'GET', undefined, token)).json()).firstName,
    ).toBe('Olha');
  });

  it('400s an empty name', async () => {
    const { token } = await registerUser('store');
    expect((await jsonRequest('/me', 'PATCH', { firstName: '   ' }, token)).status).toBe(400);
  });
});
