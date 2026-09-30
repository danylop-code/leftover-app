import type { ReportBody, ReportCreated } from '@leftover/shared';
import { and, eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { orders, reports } from '../db/schema';
import { nowIso } from '../lib/clock';
import { isUniqueViolation, notFound } from '../lib/errors';
import { newId } from '../lib/ids';

const REFERENCE_SPACE = 10_000;
const REFERENCE_DIGITS = 4;
const MAX_ATTEMPTS = 20;

export const newReference = (random: () => number = Math.random) =>
  `R-${String(Math.floor(random() * REFERENCE_SPACE)).padStart(REFERENCE_DIGITS, '0')}`;

/**
 * Stores a problem report and returns its reference. An order, if given, must be the
 * reporter's own (404 otherwise, nothing stored). References are unique; a collision retries.
 */
export const createReport = async (
  db: Db,
  userId: string,
  body: ReportBody,
  random: () => number = Math.random,
): Promise<ReportCreated> => {
  if (body.orderId) {
    const own = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.id, body.orderId), eq(orders.userId, userId)))
      .get();
    if (!own) throw notFound('No such order.');
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const reference = newReference(random);
    try {
      await db.insert(reports).values({
        id: newId(),
        reference,
        userId,
        subject: body.subject,
        orderId: body.orderId ?? null,
        message: body.message,
        createdAt: nowIso(),
      });
      return { reference };
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
    }
  }
  throw new Error('Could not find a free report reference');
};
