import { describe, expect, it } from 'vitest';
import { NearbyQuery, NearbyResponse } from './index';

describe('NearbyQuery', () => {
  it('coerces query-string numbers and keeps an optional category', () => {
    expect(
      NearbyQuery.parse({ lat: '49.8421', lng: '24.0224', radiusKm: '5', category: 'bakery' }),
    ).toEqual({ lat: 49.8421, lng: 24.0224, radiusKm: 5, category: 'bakery' });
    expect(NearbyQuery.parse({ lat: '49.8', lng: '24', radiusKm: '12' })).not.toHaveProperty(
      'category',
    );
  });

  it.each([
    ['missing lat', { lng: '24', radiusKm: '5' }],
    ['lat out of range', { lat: '95', lng: '24', radiusKm: '5' }],
    ['lng not a number', { lat: '49', lng: 'east', radiusKm: '5' }],
    ['radius below 1 km', { lat: '49', lng: '24', radiusKm: '0' }],
    ['radius above 30 km', { lat: '49', lng: '24', radiusKm: '31' }],
    ['unknown category', { lat: '49', lng: '24', radiusKm: '5', category: 'shoes' }],
  ])('rejects %s', (_name, input) => {
    expect(NearbyQuery.safeParse(input).success).toBe(false);
  });
});

describe('NearbyResponse', () => {
  const bag = {
    id: 'b1',
    title: 'Bakery surprise bag',
    category: 'bakery',
    priceMinor: 14900,
    originalPriceMinor: 45000,
    qtyAvailable: 3,
    pickupStart: '2026-09-29T15:00:00.000Z',
    pickupEnd: '2026-09-29T16:30:00.000Z',
    store: { id: 's1', name: 'Crumb & Co. Bakery', timezone: 'Europe/Kyiv' },
    distanceKm: 0.8,
  };

  it('accepts bags with a store summary and a distance', () => {
    expect(NearbyResponse.parse({ bags: [bag] }).bags[0]?.distanceKm).toBe(0.8);
  });

  it('rejects money that is not integer kopiyky', () => {
    expect(NearbyResponse.safeParse({ bags: [{ ...bag, priceMinor: 149.5 }] }).success).toBe(false);
  });
});
