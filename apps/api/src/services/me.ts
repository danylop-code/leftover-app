import type { Me, MeStats, UpdateMeBody } from '@leftover/shared';
import { and, eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { orders, users } from '../db/schema';

/** Bags rescued and money saved, from collected orders only (minor units, exact). */
export const myStats = async (db: Db, userId: string): Promise<MeStats> => {
  const rows = await db
    .select({
      qty: orders.qty,
      unitPriceMinor: orders.unitPriceMinor,
      unitOriginalPriceMinor: orders.unitOriginalPriceMinor,
    })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.status, 'collected')))
    .all();
  return {
    bagsRescued: rows.reduce((sum, o) => sum + o.qty, 0),
    savedMinor: rows.reduce(
      (sum, o) => sum + (o.unitOriginalPriceMinor - o.unitPriceMinor) * o.qty,
      0,
    ),
  };
};

export const updateMe = async (db: Db, me: Me, body: UpdateMeBody): Promise<Me> => {
  await db.update(users).set({ firstName: body.firstName }).where(eq(users.id, me.id));
  return { ...me, firstName: body.firstName };
};
