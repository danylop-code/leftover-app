import type { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import type { AppEnv } from './env';

type Fields = Record<string, string[]>;

/** A known, client-facing failure: rendered as `{ error: { code, message, ...details } }`. */
export class AppError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(readonly fields: Fields) {
    super(400, 'validation', 'Some fields are invalid.');
    this.name = 'ValidationError';
  }
}

export const unauthorized = (code = 'unauthorized', message = 'Please log in.') =>
  new AppError(401, code, message);
export const forbidden = (message = 'You can’t do that.') =>
  new AppError(403, 'forbidden', message);
export const notFound = (message = 'Not found.') => new AppError(404, 'not_found', message);
export const conflict = (code: string, message: string, details?: Record<string, unknown>) =>
  new AppError(409, code, message, details);

/**
 * Whether `e` (or anything in its `cause` chain) is a SQLite UNIQUE / PRIMARY KEY violation.
 * Drizzle wraps D1 errors, so the constraint text is only on the cause.
 */
export const isUniqueViolation = (e: unknown): boolean => {
  for (let err = e; err; err = (err as { cause?: unknown }).cause) {
    if (/UNIQUE constraint failed|SQLITE_CONSTRAINT_PRIMARYKEY/.test(String(err))) return true;
    if (typeof err !== 'object') break;
  }
  return false;
};

/** Zod issues → `{ "dotted.path": [messages] }`; root-level issues go under `_`. */
export const fieldsFromZod = (error: z.ZodError): Fields => {
  const fields: Fields = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] = [...(fields[key] ?? []), issue.message];
  }
  return fields;
};

/** Wires notFound/onError so every failure uses the shared `ApiError` envelope. */
export const installErrorHandling = (app: Hono<AppEnv>) => {
  app.notFound((c) => c.json({ error: { code: 'not_found', message: 'Not found.' } }, 404));

  app.onError((err, c) => {
    if (err instanceof ValidationError) {
      return c.json({ error: { code: err.code, message: err.message, fields: err.fields } }, 400);
    }
    if (err instanceof AppError) {
      return c.json(
        { error: { ...err.details, code: err.code, message: err.message } },
        err.status,
      );
    }
    if (err instanceof z.ZodError) {
      return c.json(
        {
          error: {
            code: 'validation',
            message: 'Some fields are invalid.',
            fields: fieldsFromZod(err),
          },
        },
        400,
      );
    }
    if (err instanceof HTTPException && err.status === 400) {
      // Hono's validator rejects unparseable bodies (e.g. malformed JSON) this way.
      return c.json(
        { error: { code: 'validation', message: 'The request body could not be read.' } },
        400,
      );
    }
    console.error(err);
    return c.json({ error: { code: 'internal', message: 'Something went wrong.' } }, 500);
  });
};
