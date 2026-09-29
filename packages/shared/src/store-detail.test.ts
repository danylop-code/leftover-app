import { describe, expect, it } from 'vitest';
import { StoreDetail, StoreDetailQuery } from './index';

const detail = {
  store: {
    id: 's1',
    name: 'Crumb & Co. Bakery',
    category: 'bakery',
    address: 'vul. Doroshenka 32',
    lat: 49.8393,
    lng: 24.0325,
    opensAt: '08:00',
    closesAt: '20:00',
    timezone: 'Europe/Kyiv',
  },
  distanceKm: 0.8,
  openStatus: 'open',
  bags: [
    {
      id: 'b1',
      title: 'Bakery surprise bag',
      description: 'Bread and pastries.',
      category: 'bakery',
      priceMinor: 14900,
      originalPriceMinor: 45000,
      qtyAvailable: 0,
      pickupStart: '2026-09-29T15:00:00.000Z',
      pickupEnd: '2026-09-29T16:30:00.000Z',
    },
  ],
  counts: { available: 0, total: 1 },
  rating: null,
  recentReviews: [],
  isFavorite: false,
};

describe('StoreDetailQuery', () => {
  it('needs the selected location, coerced from the query string', () => {
    expect(StoreDetailQuery.parse({ lat: '49.84', lng: '24.02' })).toEqual({
      lat: 49.84,
      lng: 24.02,
    });
    expect(StoreDetailQuery.safeParse({ lat: '49.84' }).success).toBe(false);
  });
});

describe('StoreDetail', () => {
  it('accepts a store with no ratings yet and sold-out bags', () => {
    expect(StoreDetail.parse(detail).rating).toBeNull();
  });

  it('accepts a rating once reviews exist', () => {
    const rating = {
      average: 4.7,
      count: 128,
      aspects: { quality: 4.8, variety: null, freshness: 4.9, ease: 4.6 },
    };
    expect(StoreDetail.parse({ ...detail, rating }).rating).toEqual(rating);
  });

  it('rejects an unknown open status', () => {
    expect(StoreDetail.safeParse({ ...detail, openStatus: 'maybe' }).success).toBe(false);
  });
});
