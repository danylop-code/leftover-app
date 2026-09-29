import type { LoginBody, Me, RegisterBody, Session } from '@leftover/shared';
import { and, eq, gt } from 'drizzle-orm';
import type { Db } from '../db/client';
import { sessions, stores, users } from '../db/schema';
import { now } from '../lib/clock';
import { conflict, unauthorized } from '../lib/errors';
import { newId } from '../lib/ids';

// 100k is the brief's minimum and the maximum deployed Workers accept (local workerd allows more).
export const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;
const TOKEN_BYTES = 32;
export const SESSION_TTL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const SCHEME = 'pbkdf2-sha256';

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

const derive = async (password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    HASH_BITS,
  );
  return new Uint8Array(bits);
};

/** Compares every byte regardless of where the first difference is. */
const constantTimeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
};

/** `pbkdf2-sha256$<iterations>$<salt b64url>$<hash b64url>` */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, PBKDF2_ITERATIONS);
  return [SCHEME, PBKDF2_ITERATIONS, toBase64Url(salt), toBase64Url(hash)].join('$');
};

/** Constant-time check; false for anything that isn't a well-formed hash (e.g. seed placeholders). */
export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [scheme, iter, salt, hash] = stored.split('$');
  const iterations = Number(iter);
  if (scheme !== SCHEME || !salt || !hash || !Number.isInteger(iterations) || iterations < 1)
    return false;
  let expected: Uint8Array;
  try {
    expected = fromBase64Url(hash);
  } catch {
    return false;
  }
  const actual = await derive(password, fromBase64Url(salt), iterations);
  return constantTimeEqual(actual, expected);
};

/** Opaque bearer token: 32 random bytes, base64url. Only its hash is stored. */
export const generateToken = () => toBase64Url(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));

export const hashToken = async (token: string) => {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(token)));
  return Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('');
};

type UserRow = typeof users.$inferSelect;

/** Public shape; the password hash never leaves this module. */
export const toMe = (u: UserRow, storeId: string | null): Me => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  role: u.role,
  createdAt: u.createdAt,
  storeId,
});

const storeIdOf = async (db: Db, userId: string) =>
  (await db.select({ id: stores.id }).from(stores).where(eq(stores.ownerId, userId)).get())?.id ??
  null;

const EMAIL_TAKEN = 'An account with this email already exists.';
const emailTaken = () => conflict('email_taken', EMAIL_TAKEN, { fields: { email: [EMAIL_TAKEN] } });

const createSession = async (db: Db, user: UserRow, storeId: string | null): Promise<Session> => {
  const token = generateToken();
  const at = now();
  await db.insert(sessions).values({
    tokenHash: await hashToken(token),
    userId: user.id,
    createdAt: at.toISOString(),
    expiresAt: new Date(at.getTime() + SESSION_TTL_DAYS * DAY_MS).toISOString(),
  });
  return { token, user: toMe(user, storeId) };
};

export const register = async (db: Db, body: RegisterBody): Promise<Session> => {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, body.email))
    .get();
  if (existing) throw emailTaken();
  const user: UserRow = {
    id: newId(),
    email: body.email,
    passwordHash: await hashPassword(body.password),
    firstName: body.firstName,
    role: body.role,
    createdAt: now().toISOString(),
  };
  try {
    await db.insert(users).values(user);
  } catch (e) {
    // Lost a race with a concurrent registration for the same email.
    if (String(e).includes('UNIQUE')) throw emailTaken();
    throw e;
  }
  return createSession(db, user, null);
};

// Verified against when the email is unknown, so both failures take the same time.
let dummyHash: Promise<string> | undefined;

export const login = async (db: Db, body: LoginBody): Promise<Session> => {
  const user = await db.select().from(users).where(eq(users.email, body.email)).get();
  dummyHash ??= hashPassword('not-a-real-password');
  const ok = await verifyPassword(body.password, user?.passwordHash ?? (await dummyHash));
  if (!user || !ok) throw unauthorized('invalid_credentials', 'Email or password is incorrect.');
  return createSession(db, user, await storeIdOf(db, user.id));
};

/** The user behind a live (unexpired) token, or null. */
export const userForToken = async (db: Db, token: string) => {
  const row = await db
    .select({ user: users, tokenHash: sessions.tokenHash, storeId: stores.id })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(stores, eq(stores.ownerId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, await hashToken(token)),
        gt(sessions.expiresAt, now().toISOString()),
      ),
    )
    .get();
  return row ?? null;
};

export const revokeSession = async (db: Db, tokenHash: string) => {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
};
