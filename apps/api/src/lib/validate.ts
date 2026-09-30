import type { ValidationTargets } from 'hono';
import { validator } from 'hono/validator';
import type { z } from 'zod';
import { fieldsFromZod, ValidationError } from './errors';

/**
 * Route middleware validating one input target with a shared Zod schema.
 * Failures become 400 `validation` with per-field messages; handlers read `c.req.valid(target)`.
 */
export const validate = <Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) =>
  validator(target, async (value) => {
    const result = await schema.safeParseAsync(value);
    if (!result.success) throw new ValidationError(fieldsFromZod(result.error));
    return result.data as z.output<Schema>;
  });
