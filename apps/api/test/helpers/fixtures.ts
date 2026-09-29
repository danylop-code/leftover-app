import { env } from 'cloudflare:test';
import type { Category } from '@leftover/shared';
import { jsonRequest, registerUser } from './auth';

// Direct D1 inserts for discovery tests: shops and bags placed at chosen coordinates.

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${++seq}-${crypto.randomUUID().slice(0, 8)}`;
const created = '2026-09-01T00:00:00.000Z';

/** A point `km` due north of `from` (1° of latitude ≈ 111.195 km on haversineKm's sphere). */
export const north = (from: { lat: number; lng: number }, km: number) => ({
  lat: from.lat + km / ((6371.0088 * Math.PI) / 180),
  lng: from.lng,
});

let centre = 0;
/** A fresh spot far from the seed's Lviv shops, so tests never see each other's rows. */
export const freshCentre = () => ({ lat: -40 + ++centre * 0.5, lng: 150 });

export const insertStore = async (
  at: { lat: number; lng: number },
  overrides: { name?: string; category?: Category } = {},
) => {
  const ownerId = nextId('owner');
  const id = nextId('store');
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, first_name, role, created_at) VALUES (?, ?, 'x', 'Owner', 'store', ?)",
    ).bind(ownerId, `${ownerId}@example.com`, created),
    env.DB.prepare(
      "INSERT INTO stores (id, owner_id, name, category, address, lat, lng, opens_at, closes_at, timezone, created_at) VALUES (?, ?, ?, ?, 'Street 1', ?, ?, '08:00', '20:00', 'Europe/Kyiv', ?)",
    ).bind(
      id,
      ownerId,
      overrides.name ?? 'Test shop',
      overrides.category ?? 'bakery',
      at.lat,
      at.lng,
      created,
    ),
  ]);
  return id;
};

type BagFields = {
  title?: string;
  category?: Category;
  qtyAvailable?: number;
  isActive?: boolean;
  pickupStart?: string;
  pickupEnd?: string;
};

export const insertBag = async (storeId: string, fields: BagFields = {}) => {
  const id = nextId('bag');
  const qty = fields.qtyAvailable ?? 3;
  await env.DB.prepare(
    `INSERT INTO bags (id, store_id, title, description, category, price_minor, original_price_minor,
       qty_total, qty_available, pickup_start, pickup_end, is_active, created_at, updated_at)
     VALUES (?, ?, ?, '', ?, 14900, 45000, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      storeId,
      fields.title ?? 'Surprise bag',
      fields.category ?? 'bakery',
      Math.max(qty, 5),
      qty,
      fields.pickupStart ?? '2026-09-29T15:00:00.000Z',
      fields.pickupEnd ?? '2026-09-29T16:30:00.000Z',
      fields.isActive === false ? 0 : 1,
      created,
      created,
    )
    .run();
  return id;
};

type OrderFields = {
  qty?: number;
  status?: 'reserved' | 'collected' | 'cancelled';
  code?: string;
  unitPriceMinor?: number;
  unitOriginalPriceMinor?: number;
  createdAt?: string;
  collectedAt?: string | null;
  cancelledAt?: string | null;
};

/** An order row as it would exist after reserving (stock is not touched: set it on the bag). */
export const insertOrder = async (
  userId: string,
  bagId: string,
  storeId: string,
  fields: OrderFields = {},
) => {
  const id = nextId('order');
  await env.DB.prepare(
    `INSERT INTO orders (id, user_id, bag_id, store_id, qty, unit_price_minor,
       unit_original_price_minor, code, status, created_at, collected_at, cancelled_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      userId,
      bagId,
      storeId,
      fields.qty ?? 1,
      fields.unitPriceMinor ?? 14900,
      fields.unitOriginalPriceMinor ?? 45000,
      fields.code ?? String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
      fields.status ?? 'reserved',
      fields.createdAt ?? '2026-09-29T10:00:00.000Z',
      fields.collectedAt ?? null,
      fields.cancelledAt ?? null,
    )
    .run();
  return id;
};

/** A shop owner with a shop at `at`, signed in. */
export const shopOwner = async (at: { lat: number; lng: number }) => {
  const session = await registerUser('store');
  const res = await jsonRequest(
    '/stores/me',
    'POST',
    {
      name: 'Owner’s shop',
      category: 'bakery',
      address: 'Street 1',
      lat: at.lat,
      lng: at.lng,
      opensAt: '08:00',
      closesAt: '20:00',
    },
    session.token,
  );
  const store = (await res.json()) as { id: string };
  return { token: session.token, userId: session.user.id, storeId: store.id };
};
