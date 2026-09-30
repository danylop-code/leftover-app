import { haversineKm } from '@leftover/shared';
import { describe, expect, it } from 'vitest';
import { boundingBox, rankNearby } from './discovery';

const lviv = { lat: 49.8421, lng: 24.0224 };

// A point `km` away from `from` towards `bearingDeg` (spherical Earth).
const destination = (from: { lat: number; lng: number }, km: number, bearingDeg: number) => {
  const R = 6371.0088;
  const rad = (d: number) => (d * Math.PI) / 180;
  const deg = (r: number) => (r * 180) / Math.PI;
  const δ = km / R;
  const θ = rad(bearingDeg);
  const φ1 = rad(from.lat);
  const λ1 = rad(from.lng);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    λ1 +
    Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: deg(φ2), lng: deg(λ2) };
};

const inside = (p: { lat: number; lng: number }, box: ReturnType<typeof boundingBox>) =>
  p.lat >= box.minLat && p.lat <= box.maxLat && p.lng >= box.minLng && p.lng <= box.maxLng;

describe('boundingBox', () => {
  it.each([1, 5, 30])('contains every point on a %i km circle', (km) => {
    const box = boundingBox(lviv, km);
    for (let bearing = 0; bearing < 360; bearing += 15) {
      expect(inside(destination(lviv, km * 0.999, bearing), box)).toBe(true);
    }
  });

  it('stays tight: points well outside the radius fall outside the box', () => {
    const box = boundingBox(lviv, 5);
    for (const bearing of [0, 90, 180, 270]) {
      expect(inside(destination(lviv, 5.2, bearing), box)).toBe(false);
    }
  });

  it('widens longitude with latitude', () => {
    const north = boundingBox({ lat: 60, lng: 24 }, 5);
    const south = boundingBox({ lat: 10, lng: 24 }, 5);
    expect(north.maxLng - north.minLng).toBeGreaterThan(south.maxLng - south.minLng);
  });
});

describe('rankNearby', () => {
  const at = (id: string, km: number, pickupStart = '2026-09-29T15:00:00.000Z') => ({
    id,
    pickupStart,
    lat: destination(lviv, km, 0).lat,
    lng: lviv.lng,
  });

  it('keeps bags within the radius, nearest first, ties by earliest pickup', () => {
    const ranked = rankNearby(
      [
        at('far', 6),
        at('mid', 1.4),
        at('near-late', 0.8, '2026-09-29T17:00:00.000Z'),
        at('near-early', 0.8, '2026-09-29T15:00:00.000Z'),
      ],
      lviv,
      5,
    );
    expect(ranked.map((r) => r.row.id)).toEqual(['near-early', 'near-late', 'mid']);
    expect(ranked[0]?.distanceKm).toBeCloseTo(haversineKm(lviv, at('x', 0.8)), 6);
  });

  it('includes a bag exactly on the radius', () => {
    expect(rankNearby([at('edge', 5)], lviv, 5)).toHaveLength(1);
  });
});
