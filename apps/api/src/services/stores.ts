import { type Store, StoreProfileBody, type StoreProfilePatch } from '@leftover/shared';
import { eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { stores } from '../db/schema';
import { now } from '../lib/clock';
import { conflict, fieldsFromZod, notFound, ValidationError } from '../lib/errors';
import { newId } from '../lib/ids';

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
): Promise<Store> => {
  if (await findByOwner(db, ownerId)) throw storeExists();
  const row: StoreRow = { id: newId(), ownerId, ...body, createdAt: now().toISOString() };
  try {
    await db.insert(stores).values(row);
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw storeExists();
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
  const next = { name, category, address, lat, lng, opensAt, closesAt, timezone };
  await db.update(stores).set(next).where(eq(stores.id, row.id));
  return toStore({ ...row, ...next });
};
