import { type FavoritesQuery, haversineKm, type SavedShop } from '@leftover/shared';
import { and, count, eq, gt, inArray } from 'drizzle-orm';
import type { Db } from '../db/client';
import { bags, favorites, stores } from '../db/schema';
import { nowIso } from '../lib/clock';
import { notFound } from '../lib/errors';
import { storeRatings } from './reviews';

const requireStore = async (db: Db, storeId: string) => {
  const store = await db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).get();
  if (!store) throw notFound('This shop doesn’t exist.');
};

/** Saves a shop; saving it again changes nothing. */
export const addFavorite = async (db: Db, userId: string, storeId: string) => {
  await requireStore(db, storeId);
  await db.insert(favorites).values({ userId, storeId, createdAt: nowIso() }).onConflictDoNothing();
};

/** Unsaves a shop; unsaving one that isn't saved changes nothing. */
export const removeFavorite = async (db: Db, userId: string, storeId: string) => {
  await requireStore(db, storeId);
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.storeId, storeId)));
};

/** Which of `storeIds` the user saved. */
export const favoriteStoreIds = async (db: Db, userId: string, storeIds: string[]) => {
  if (storeIds.length === 0) return new Set<string>();
  const rows = await db
    .select({ storeId: favorites.storeId })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), inArray(favorites.storeId, [...new Set(storeIds)])))
    .all();
  return new Set(rows.map((r) => r.storeId));
};

/** The customer's saved shops, nearest to `from` first, with rating and bags still on offer. */
export const listFavorites = async (
  db: Db,
  userId: string,
  from: FavoritesQuery,
): Promise<SavedShop[]> => {
  const saved = await db
    .select({
      id: stores.id,
      name: stores.name,
      category: stores.category,
      address: stores.address,
      lat: stores.lat,
      lng: stores.lng,
    })
    .from(favorites)
    .innerJoin(stores, eq(favorites.storeId, stores.id))
    .where(eq(favorites.userId, userId))
    .all();
  if (saved.length === 0) return [];
  const ids = saved.map((s) => s.id);
  const [ratings, available] = await Promise.all([
    storeRatings(db, ids),
    db
      .select({ storeId: bags.storeId, n: count() })
      .from(bags)
      .where(
        and(
          inArray(bags.storeId, ids),
          eq(bags.isActive, true),
          gt(bags.qtyAvailable, 0),
          gt(bags.pickupEnd, nowIso()),
        ),
      )
      .groupBy(bags.storeId)
      .all(),
  ]);
  const counts = new Map(available.map((a) => [a.storeId, a.n]));
  return saved
    .map(({ lat, lng, ...store }) => ({
      store,
      distanceKm: haversineKm(from, { lat, lng }),
      rating: ratings.get(store.id) ?? null,
      bagsAvailable: counts.get(store.id) ?? 0,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
};
