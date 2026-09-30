import { describe, expect, it } from 'vitest';
import { BagBody, BagPatch } from './index';

const valid = {
  title: 'Bakery surprise bag',
  category: 'bakery',
  originalPriceMinor: 45000,
  priceMinor: 14900,
  qtyTotal: 5,
  pickupStart: '2026-09-29T15:00:00.000Z',
  pickupEnd: '2026-09-29T16:30:00.000Z',
};

const pathsOf = (input: unknown) => {
  const result = BagBody.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

describe('BagBody', () => {
  it('accepts a valid bag and defaults description and live', () => {
    expect(BagBody.parse(valid)).toMatchObject({ description: '', isActive: true });
  });

  it('requires the sale price below the original', () => {
    expect(pathsOf({ ...valid, priceMinor: 45000 })).toEqual(['priceMinor']);
    expect(pathsOf({ ...valid, priceMinor: 0 })).toEqual(['priceMinor']);
  });

  it('keeps money in whole kopiyky', () => {
    expect(pathsOf({ ...valid, priceMinor: 149.5 })).toContain('priceMinor');
  });

  it('requires a window of at least 30 minutes (exactly 30 is fine)', () => {
    expect(pathsOf({ ...valid, pickupEnd: '2026-09-29T15:29:59.000Z' })).toEqual(['pickupEnd']);
    expect(pathsOf({ ...valid, pickupEnd: '2026-09-29T15:30:00.000Z' })).toEqual([]);
  });

  it.each([
    ['title', { title: 'Hi' }],
    ['title', { title: 'x'.repeat(61) }],
    ['description', { description: 'x'.repeat(201) }],
    ['qtyTotal', { qtyTotal: 0 }],
    ['qtyTotal', { qtyTotal: 51 }],
    ['category', { category: 'shoes' }],
  ])('rejects a bad %s', (field, change) => {
    expect(pathsOf({ ...valid, ...change })).toContain(field);
  });
});

describe('BagPatch', () => {
  it('accepts any subset, but still checks the rules it can see', () => {
    expect(BagPatch.safeParse({ isActive: false }).success).toBe(true);
    expect(BagPatch.safeParse({ priceMinor: 500, originalPriceMinor: 400 }).success).toBe(false);
  });
});
