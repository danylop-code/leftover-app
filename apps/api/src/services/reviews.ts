import {
  RECENT_REVIEWS_LIMIT,
  type ReviewBody,
  ReviewBody as ReviewBodySchema,
  type ReviewSummary,
  roundRating,
  type StoreRating,
  type StoreRatingDetail,
} from '@leftover/shared';
import { and, avg, count, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from '../db/client';
import { orders, reviews, users } from '../db/schema';
import { nowIso } from '../lib/clock';
import { conflict, isUniqueViolation, notFound } from '../lib/errors';

const ratingColumns = {
  storeId: reviews.storeId,
  average: avg(reviews.overall),
  count: count(),
};

const toRating = (row: { average: string | null; count: number }): StoreRating | null =>
  row.count > 0 && row.average !== null
    ? { average: roundRating(Number(row.average)), count: row.count }
    : null;

const aspect = (value: string | null) => (value === null ? null : roundRating(Number(value)));

/** Average (one decimal) and count per store; stores without reviews are absent. */
export const storeRatings = async (db: Db, storeIds: string[]) => {
  const out = new Map<string, StoreRating>();
  if (storeIds.length === 0) return out;
  const rows = await db
    .select(ratingColumns)
    .from(reviews)
    .where(inArray(reviews.storeId, [...new Set(storeIds)]))
    .groupBy(reviews.storeId)
    .all();
  for (const row of rows) {
    const rating = toRating(row);
    if (rating) out.set(row.storeId, rating);
  }
  return out;
};

/** One store's rating with per-aspect averages; unanswered aspects don't count. */
export const storeRatingDetail = async (
  db: Db,
  storeId: string,
): Promise<StoreRatingDetail | null> => {
  const row = await db
    .select({
      ...ratingColumns,
      quality: avg(reviews.quality),
      variety: avg(reviews.variety),
      freshness: avg(reviews.freshness),
      ease: avg(reviews.ease),
    })
    .from(reviews)
    .where(eq(reviews.storeId, storeId))
    .get();
  const rating = row ? toRating(row) : null;
  if (!row || !rating) return null;
  return {
    ...rating,
    aspects: {
      quality: aspect(row.quality),
      variety: aspect(row.variety),
      freshness: aspect(row.freshness),
      ease: aspect(row.ease),
    },
  };
};

/** Newest reviews for a store, with the reviewer's display name. */
export const recentReviews = async (
  db: Db,
  storeId: string,
  limit = RECENT_REVIEWS_LIMIT,
): Promise<ReviewSummary[]> => {
  const rows = await db
    .select({
      id: reviews.orderId,
      authorName: users.firstName,
      overall: reviews.overall,
      text: reviews.text,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.storeId, storeId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .all();
  return rows;
};

/** The customer's overall rating per order, for orders they reviewed. */
export const ratingsForOrders = async (db: Db, orderIds: string[]) => {
  const out = new Map<string, number>();
  if (orderIds.length === 0) return out;
  const rows = await db
    .select({ orderId: reviews.orderId, overall: reviews.overall })
    .from(reviews)
    .where(inArray(reviews.orderId, orderIds))
    .all();
  for (const row of rows) out.set(row.orderId, row.overall);
  return out;
};

/** Reviews a collected order of the customer's; one review per order. */
export const createReview = async (
  db: Db,
  userId: string,
  orderId: string,
  input: ReviewBody,
): Promise<void> => {
  const body = ReviewBodySchema.parse(input);
  const order = await db
    .select({ storeId: orders.storeId, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .get();
  if (!order) throw notFound('No such order.');
  if (order.status !== 'collected')
    throw conflict('not_collected', 'You can review a bag once you’ve collected it.');
  try {
    await db.insert(reviews).values({
      orderId,
      storeId: order.storeId,
      userId,
      overall: body.overall,
      quality: body.quality ?? null,
      variety: body.variety ?? null,
      freshness: body.freshness ?? null,
      ease: body.ease ?? null,
      text: body.text,
      createdAt: nowIso(),
    });
  } catch (e) {
    if (isUniqueViolation(e))
      throw conflict('already_reviewed', 'You’ve already reviewed this bag.');
    throw e;
  }
};
