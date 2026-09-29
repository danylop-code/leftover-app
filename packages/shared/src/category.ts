import { z } from 'zod';

/** Bag/store category, shared by api (DB values) and mobile (chips, media tints). */
export const Category = z.enum(['bakery', 'meals', 'groceries', 'cafe', 'produce', 'other']);
export type Category = z.infer<typeof Category>;
