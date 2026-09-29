import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from '../db/client';
import { favorites, stores } from '../db/schema';
import { nowIso } from '../lib/clock';
import { notFound } from '../lib/errors';

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
