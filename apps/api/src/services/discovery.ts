import { haversineKm, type LatLng, type NearbyBag, type NearbyQuery } from '@leftover/shared';
import { and, eq, gt, gte, lte } from 'drizzle-orm';
import type { Db } from '../db/client';
import { bags, stores } from '../db/schema';
import { nowIso } from '../lib/clock';

// Kilometres per degree of latitude on the sphere haversineKm uses (R = 6371.0088 km).
const KM_PER_DEGREE = (6371.0088 * Math.PI) / 180;
// A tiny margin so floating-point rounding never drops a point that sits on the radius.
const BOX_MARGIN = 1.001;

export type Box = { minLat: number; maxLat: number; minLng: number; maxLng: number };

/**
 * Lat/lng box around a circle of `radiusKm`, for an indexable SQL prefilter; haversineKm then
 * trims the corners. Longitude degrees shrink with cos(latitude). Not antimeridian-aware.
 */
export const boundingBox = (center: LatLng, radiusKm: number): Box => {
  const dLat = (radiusKm / KM_PER_DEGREE) * BOX_MARGIN;
  const cosLat = Math.max(Math.cos((center.lat * Math.PI) / 180), Number.EPSILON);
  const dLng = dLat / cosLat;
  return {
    minLat: center.lat - dLat,
    maxLat: center.lat + dLat,
    minLng: center.lng - dLng,
    maxLng: center.lng + dLng,
  };
};

type Rankable = LatLng & { pickupStart: string };

/** Rows within `radiusKm` of `from` with their distance: nearest first, then earliest pickup. */
export const rankNearby = <T extends Rankable>(rows: T[], from: LatLng, radiusKm: number) =>
  rows
    .map((row) => ({ row, distanceKm: haversineKm(from, row) }))
    .filter((r) => r.distanceKm <= radiusKm)
    .sort(
      (a, b) => a.distanceKm - b.distanceKm || a.row.pickupStart.localeCompare(b.row.pickupStart),
    );

/**
 * Bags customers can still reserve near the query point: active, in stock, window not over.
 * Distances are always from the query's lat/lng (the customer's selected location).
 */
export const nearbyBags = async (db: Db, query: NearbyQuery): Promise<NearbyBag[]> => {
  const from = { lat: query.lat, lng: query.lng };
  const box = boundingBox(from, query.radiusKm);
  const rows = await db
    .select({
      id: bags.id,
      title: bags.title,
      category: bags.category,
      priceMinor: bags.priceMinor,
      originalPriceMinor: bags.originalPriceMinor,
      qtyAvailable: bags.qtyAvailable,
      pickupStart: bags.pickupStart,
      pickupEnd: bags.pickupEnd,
      storeId: stores.id,
      storeName: stores.name,
      timezone: stores.timezone,
      lat: stores.lat,
      lng: stores.lng,
    })
    .from(bags)
    .innerJoin(stores, eq(bags.storeId, stores.id))
    .where(
      and(
        gte(stores.lat, box.minLat),
        lte(stores.lat, box.maxLat),
        gte(stores.lng, box.minLng),
        lte(stores.lng, box.maxLng),
        eq(bags.isActive, true),
        gt(bags.qtyAvailable, 0),
        gt(bags.pickupEnd, nowIso()),
        query.category ? eq(bags.category, query.category) : undefined,
      ),
    )
    .all();

  return rankNearby(rows, from, query.radiusKm).map(({ row, distanceKm }) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    priceMinor: row.priceMinor,
    originalPriceMinor: row.originalPriceMinor,
    qtyAvailable: row.qtyAvailable,
    pickupStart: row.pickupStart,
    pickupEnd: row.pickupEnd,
    store: { id: row.storeId, name: row.storeName, timezone: row.timezone },
    distanceKm,
  }));
};
