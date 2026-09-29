import { env } from 'cloudflare:test';
import { ApiError, Me, Session } from '@leftover/shared';
import { Hono } from 'hono';
import { afterEach, describe, expect, it } from 'vitest';
import { requireRole } from '../src/lib/auth';
import { freezeClock, resetClock } from '../src/lib/clock';
import { withDb } from '../src/lib/db';
import type { AppEnv } from '../src/lib/env';
import { installErrorHandling } from '../src/lib/errors';
import { jsonRequest, registerUser, uniqueEmail } from './helpers/auth';

const errorOf = async (res: Response) => ApiError.parse(await res.json()).error;

afterEach(resetClock);

describe('POST /auth/register', () => {
  it('creates a customer: 201 with a token and Me', async () => {
    const email = uniqueEmail();
    const res = await jsonRequest('/auth/register', 'POST', {
      role: 'customer',
      firstName: 'Olena',
      email,
      password: 'leftover24',
    });
    expect(res.status).toBe(201);
    const session = Session.parse(await res.json());
    expect(session.token.length).toBeGreaterThan(20);
    expect(session.user).toMatchObject({ role: 'customer', email, firstName: 'Olena' });
  });

  it('creates a shop owner with role store', async () => {
    const session = await registerUser('store');
    expect(session.user.role).toBe('store');
  });

  it('409s email_taken for an existing email in any case, flagged on the email field', async () => {
    const email = uniqueEmail();
    await jsonRequest('/auth/register', 'POST', {
      role: 'customer',
      firstName: 'A',
      email,
      password: 'leftover24',
    });
    const res = await jsonRequest('/auth/register', 'POST', {
      role: 'store',
      firstName: 'B',
      email: email.toUpperCase(),
      password: 'leftover24',
    });
    expect(res.status).toBe(409);
    const error = await errorOf(res);
    expect(error.code).toBe('email_taken');
    expect(error.fields?.email).toHaveLength(1);
  });

  it('400s a password shorter than 8 characters', async () => {
    const res = await jsonRequest('/auth/register', 'POST', {
      role: 'customer',
      firstName: 'Olena',
      email: uniqueEmail(),
      password: 'short',
    });
    expect(res.status).toBe(400);
    const error = await errorOf(res);
    expect(error.code).toBe('validation');
    expect(error.fields).toHaveProperty('password');
  });
});

describe('POST /auth/login', () => {
  it('returns a new session for the right password, with the email in any case', async () => {
    const { user } = await registerUser('customer', 'leftover24');
    const res = await jsonRequest('/auth/login', 'POST', {
      email: user.email.toUpperCase(),
      password: 'leftover24',
    });
    expect(res.status).toBe(200);
    expect(Session.parse(await res.json()).user.id).toBe(user.id);
  });

  it('401s invalid_credentials with the same message for a wrong password and an unknown email', async () => {
    const { user } = await registerUser();
    const wrong = await jsonRequest('/auth/login', 'POST', {
      email: user.email,
      password: 'nope-nope',
    });
    const unknown = await jsonRequest('/auth/login', 'POST', {
      email: uniqueEmail(),
      password: 'leftover24',
    });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    const a = await errorOf(wrong);
    const b = await errorOf(unknown);
    expect(a.code).toBe('invalid_credentials');
    expect(b).toEqual(a);
  });
});

describe('GET /me and sessions', () => {
  it('returns Me for a valid token', async () => {
    const { token, user } = await registerUser();
    const res = await jsonRequest('/me', 'GET', undefined, token);
    expect(res.status).toBe(200);
    expect(Me.parse(await res.json())).toEqual(user);
  });

  it('401s without a token or with a garbage token', async () => {
    expect((await jsonRequest('/me', 'GET')).status).toBe(401);
    const res = await jsonRequest('/me', 'GET', undefined, 'not-a-token');
    expect(res.status).toBe(401);
    expect((await errorOf(res)).code).toBe('unauthorized');
  });

  it('401s an expired token (30 days)', async () => {
    freezeClock('2026-09-01T10:00:00.000Z');
    const { token } = await registerUser();
    freezeClock('2026-09-30T10:00:00.000Z');
    expect((await jsonRequest('/me', 'GET', undefined, token)).status).toBe(200);
    freezeClock('2026-10-01T10:00:01.000Z');
    expect((await jsonRequest('/me', 'GET', undefined, token)).status).toBe(401);
  });

  it('logout deletes the session server-side; the token then 401s', async () => {
    const { token } = await registerUser();
    const res = await jsonRequest('/auth/logout', 'POST', undefined, token);
    expect(res.status).toBe(204);
    expect((await jsonRequest('/me', 'GET', undefined, token)).status).toBe(401);
    expect((await jsonRequest('/auth/logout', 'POST', undefined, token)).status).toBe(401);
  });

  it('logout revokes only that session', async () => {
    const { user, token } = await registerUser('customer', 'leftover24');
    const other = await jsonRequest('/auth/login', 'POST', {
      email: user.email,
      password: 'leftover24',
    });
    const second = Session.parse(await other.json());
    await jsonRequest('/auth/logout', 'POST', undefined, token);
    expect((await jsonRequest('/me', 'GET', undefined, second.token)).status).toBe(200);
  });
});

describe('requireRole', () => {
  const guarded = new Hono<AppEnv>();
  installErrorHandling(guarded);
  guarded.use(withDb);
  guarded.get('/store-only', requireRole('store'), (c) =>
    c.json({ ok: true, role: c.var.user.role }),
  );
  const call = (token?: string) =>
    guarded.request(
      '/store-only',
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      env,
    );

  it('403s forbidden for a customer token', async () => {
    const { token } = await registerUser('customer');
    const res = await call(token);
    expect(res.status).toBe(403);
    expect((await errorOf(res)).code).toBe('forbidden');
  });

  it('lets the right role through and 401s without a token', async () => {
    const { token } = await registerUser('store');
    expect((await call(token)).status).toBe(200);
    expect((await call()).status).toBe(401);
  });
});

describe('credentials never leak', () => {
  it('no response contains a password hash', async () => {
    const email = uniqueEmail();
    const bodies = [
      await (
        await jsonRequest('/auth/register', 'POST', {
          role: 'customer',
          firstName: 'O',
          email,
          password: 'leftover24',
        })
      ).text(),
    ];
    const login = await jsonRequest('/auth/login', 'POST', { email, password: 'leftover24' });
    const loginText = await login.text();
    bodies.push(loginText);
    const { token } = Session.parse(JSON.parse(loginText));
    bodies.push(await (await jsonRequest('/me', 'GET', undefined, token)).text());
    for (const b of bodies) expect(b).not.toMatch(/pbkdf2|passwordHash|password_hash|leftover24/);
  });
});
