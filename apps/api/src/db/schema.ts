// Drizzle table definitions. Money columns are integer minor units; timestamps are ISO UTC text.
// After a change: `pnpm --filter @leftover/api db:generate`.
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

const createdAt = () => text('created_at').notNull();

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  /** Stored lowercase. */
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  role: text('role', { enum: ['customer', 'store'] }).notNull(),
  createdAt: createdAt(),
});

export const sessions = sqliteTable(
  'sessions',
  {
    /** SHA-256 of the opaque bearer token; the token itself is never stored. */
    tokenHash: text('token_hash').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    expiresAt: text('expires_at').notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

export const stores = sqliteTable(
  'stores',
  {
    id: text('id').primaryKey(),
    /** One shop per owner. */
    ownerId: text('owner_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: text('category', {
      enum: ['bakery', 'meals', 'groceries', 'cafe', 'produce', 'other'],
    }).notNull(),
    address: text('address').notNull(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    /** `HH:mm` in the store's timezone. */
    opensAt: text('opens_at').notNull(),
    closesAt: text('closes_at').notNull(),
    timezone: text('timezone').notNull().default('Europe/Kyiv'),
    /** R2 keys of the uploaded logo and cover (20). */
    logoKey: text('logo_key'),
    coverKey: text('cover_key'),
    createdAt: createdAt(),
  },
  (t) => [index('stores_lat_lng_idx').on(t.lat, t.lng)],
);

export const bags = sqliteTable(
  'bags',
  {
    id: text('id').primaryKey(),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    category: text('category', {
      enum: ['bakery', 'meals', 'groceries', 'cafe', 'produce', 'other'],
    }).notNull(),
    priceMinor: integer('price_minor').notNull(),
    originalPriceMinor: integer('original_price_minor').notNull(),
    qtyTotal: integer('qty_total').notNull(),
    qtyAvailable: integer('qty_available').notNull(),
    pickupStart: text('pickup_start').notNull(),
    pickupEnd: text('pickup_end').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    /** R2 key of the uploaded photo (20). */
    photoKey: text('photo_key'),
    createdAt: createdAt(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('bags_store_pickup_end_idx').on(t.storeId, t.pickupEnd),
    // Last line of defence behind the guarded stock UPDATEs (gotchas.md).
    check(
      'bags_qty_available_range',
      sql`${t.qtyAvailable} >= 0 AND ${t.qtyAvailable} <= ${t.qtyTotal}`,
    ),
    check('bags_price_non_negative', sql`${t.priceMinor} >= 0 AND ${t.originalPriceMinor} >= 0`),
  ],
);

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    bagId: text('bag_id')
      .notNull()
      .references(() => bags.id),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id),
    qty: integer('qty').notNull(),
    /** Price snapshots at reservation time. */
    unitPriceMinor: integer('unit_price_minor').notNull(),
    unitOriginalPriceMinor: integer('unit_original_price_minor').notNull(),
    /** 4-digit pickup code, unique among the store's reserved orders for the day. */
    code: text('code').notNull(),
    status: text('status', { enum: ['reserved', 'collected', 'cancelled'] })
      .notNull()
      .default('reserved'),
    createdAt: createdAt(),
    collectedAt: text('collected_at'),
    cancelledAt: text('cancelled_at'),
  },
  (t) => [
    index('orders_user_idx').on(t.userId),
    index('orders_bag_idx').on(t.bagId),
    index('orders_store_code_idx').on(t.storeId, t.code),
    check('orders_qty_positive', sql`${t.qty} > 0`),
  ],
);

const stars = (name: string) => integer(name);

/** One review per collected order (13). Aspects are optional. */
export const reviews = sqliteTable(
  'reviews',
  {
    orderId: text('order_id')
      .primaryKey()
      .references(() => orders.id, { onDelete: 'cascade' }),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    overall: stars('overall').notNull(),
    quality: stars('quality'),
    variety: stars('variety'),
    freshness: stars('freshness'),
    ease: stars('ease'),
    text: text('text').notNull().default(''),
    createdAt: createdAt(),
  },
  (t) => [
    index('reviews_store_created_idx').on(t.storeId, t.createdAt),
    check('reviews_overall_range', sql`${t.overall} BETWEEN 1 AND 5`),
  ],
);

/** Shops a customer saved (14). */
export const favorites = sqliteTable(
  'favorites',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.storeId] })],
);

/** Problem reports (16). Stored only; there is no support inbox yet. */
export const reports = sqliteTable(
  'reports',
  {
    id: text('id').primaryKey(),
    /** `R-####`, quoted to the user. */
    reference: text('reference').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subject: text('subject', { enum: ['order', 'closed', 'app', 'payment', 'other'] }).notNull(),
    orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
    message: text('message').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('reports_user_idx').on(t.userId)],
);
