import { describe, expect, it } from 'vitest';
import { haversineKm } from './geo';

// Reference great-circle distances (spherical Earth, R = 6371.0088 km).
const pairs = [
  {
    name: 'Lviv → Kyiv',
    a: { lat: 49.8397, lng: 24.0297 },
    b: { lat: 50.4501, lng: 30.5234 },
    km: 468.1,
  },
  {
    name: 'London → Paris',
    a: { lat: 51.5074, lng: -0.1278 },
    b: { lat: 48.8566, lng: 2.3522 },
    km: 343.6,
  },
  {
    name: 'New York → Los Angeles',
    a: { lat: 40.7128, lng: -74.006 },
    b: { lat: 34.0522, lng: -118.2437 },
    km: 3936,
  },
  {
    name: 'Sydney → Tokyo',
    a: { lat: -33.8688, lng: 151.2093 },
    b: { lat: 35.6762, lng: 139.6503 },
    km: 7823,
  },
];

describe('haversineKm', () => {
  it.each(pairs)('$name is within ±0.5%', ({ a, b, km }) => {
    expect(Math.abs(haversineKm(a, b) - km) / km).toBeLessThan(0.005);
  });

  it('is zero for the same point and symmetric', () => {
    const p = { lat: 49.84, lng: 24.03 };
    const q = { lat: 49.85, lng: 24.02 };
    expect(haversineKm(p, p)).toBe(0);
    expect(haversineKm(p, q)).toBeCloseTo(haversineKm(q, p), 10);
  });

  it('handles short in-city distances', () => {
    // ~0.8 km apart in Lviv.
    const d = haversineKm({ lat: 49.8397, lng: 24.0297 }, { lat: 49.8397, lng: 24.0408 });
    expect(d).toBeGreaterThan(0.75);
    expect(d).toBeLessThan(0.85);
  });
});
