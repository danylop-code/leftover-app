import {
  haversineKm,
  type Market,
  type Store,
  type StoreDetail,
  type StoreDetailQuery,
  StoreProfileBody,
  type StoreProfilePatch,
} from '@leftover/shared';
import { and, asc, eq, gt } from 'drizzle-orm';
import type { Db } from '../db/client';
import { bags, stores } from '../db/schema';
import { now, nowIso } from '../lib/clock';
import {
  conflict,
  fieldsFromZod,
  isUniqueViolation,
  notFound,
  ValidationError,
} from '../lib/errors';
import { newId } from '../lib/ids';
import { favoriteStoreIds } from './favorites';
import { imageUrl } from './image-keys';
import { openStatus } from './opening-hours';
import { recentReviews, storeRatingDetail } from './reviews';

type StoreRow = typeof stores.$inferSelect;

export const toStore = (s: StoreRow): Store => ({
  id: s.id,
  name: s.name,
  category: s.category,
  address: s.address,
  lat: s.lat,
  lng: s.lng,
  opensAt: s.opensAt,
  closesAt: s.closesAt,
  timezone: s.timezone,
  logoUrl: imageUrl(s.logoKey),
  coverUrl: imageUrl(s.coverKey),
});

const storeExists = () => conflict('store_exists', 'You already have a shop.');

const findByOwner = (db: Db, ownerId: string) =>
  db.select().from(stores).where(eq(stores.ownerId, ownerId)).get();

export const getMyStore = async (db: Db, ownerId: string): Promise<Store> => {
  const row = await findByOwner(db, ownerId);
  if (!row) throw notFound('You haven’t set up your shop yet.');
  return toStore(row);
};

/** One shop per owner: a second create is 409 `store_exists` (also under a concurrent race). */
export const createMyStore = async (
  db: Db,
  ownerId: string,
  body: StoreProfileBody,
  market: Market,
): Promise<Store> => {
  if (await findByOwner(db, ownerId)) throw storeExists();
  const row: StoreRow = {
    id: newId(),
    ownerId,
    ...body,
    timezone: body.timezone ?? market.timezone,
    logoKey: null,
    coverKey: null,
    createdAt: now().toISOString(),
  };
  try {
    await db.insert(stores).values(row);
  } catch (e) {
    if (isUniqueViolation(e)) throw storeExists();
    throw e;
  }
  return toStore(row);
};

/** Applies a partial update; the merged profile must still be valid (e.g. hours). */
export const updateMyStore = async (
  db: Db,
  ownerId: string,
  patch: StoreProfilePatch,
): Promise<Store> => {
  const row = await findByOwner(db, ownerId);
  if (!row) throw notFound('You haven’t set up your shop yet.');
  const merged = StoreProfileBody.safeParse({ ...toStore(row), ...patch });
  if (!merged.success) throw new ValidationError(fieldsFromZod(merged.error));
  const { name, category, address, lat, lng, opensAt, closesAt, timezone } = merged.data;
  const next = {
    name,
    category,
    address,
    lat,
    lng,
    opensAt,
    closesAt,
    timezone: timezone ?? row.timezone,
  };
  await db.update(stores).set(next).where(eq(stores.id, row.id));
  return toStore({ ...row, ...next });
};

/**
 * A shop as a customer sees it: distance from their selected location, whether it's open now
 * (in its timezone), and today's bags whose window hasn't ended, sold-out ones included.
 */
export const getStoreDetail = async (
  db: Db,
  id: string,
  from: StoreDetailQuery,
  userId: string,
): Promise<StoreDetail> => {
  const row = await db.select().from(stores).where(eq(stores.id, id)).get();
  if (!row) throw notFound('This shop doesn’t exist.');
  const today = await db
    .select({
      id: bags.id,
      title: bags.title,
      description: bags.description,
      category: bags.category,
      priceMinor: bags.priceMinor,
      originalPriceMinor: bags.originalPriceMinor,
      qtyAvailable: bags.qtyAvailable,
      pickupStart: bags.pickupStart,
      pickupEnd: bags.pickupEnd,
      photoKey: bags.photoKey,
    })
    .from(bags)
    .where(and(eq(bags.storeId, id), eq(bags.isActive, true), gt(bags.pickupEnd, nowIso())))
    .orderBy(asc(bags.pickupStart))
    .all();
  const listed = today.map(({ photoKey, ...b }) => ({ ...b, photoUrl: imageUrl(photoKey) }));
  const available = listed.filter((b) => b.qtyAvailable > 0);
  const soldOut = listed.filter((b) => b.qtyAvailable <= 0);
  const store = toStore(row);
  const [rating, reviews, saved] = await Promise.all([
    storeRatingDetail(db, id),
    recentReviews(db, id),
    favoriteStoreIds(db, userId, [id]),
  ]);
  return {
    store,
    distanceKm: haversineKm(from, store),
    openStatus: openStatus(store, now()),
    bags: [...available, ...soldOut],
    counts: { available: available.length, total: today.length },
    rating,
    recentReviews: reviews,
    isFavorite: saved.has(id),
  };
};
