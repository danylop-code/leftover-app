import { env } from 'cloudflare:test';
import { ReportCreated } from '@leftover/shared';
import { describe, expect, it } from 'vitest';
import { createDb } from '../src/db/client';
import { createReport } from '../src/services/reports';
import { jsonRequest, registerUser } from './helpers/auth';
import { freshCentre, insertBag, insertOrder, insertStore } from './helpers/fixtures';

const report = (body: unknown, token?: string) => jsonRequest('/reports', 'POST', body, token);
const stored = async (userId: string) =>
  (
    await env.DB.prepare('SELECT COUNT(*) AS n FROM reports WHERE user_id = ?')
      .bind(userId)
      .first<{ n: number }>()
  )?.n;

describe('POST /reports', () => {
  it('stores a report and returns an R-#### reference', async () => {
    const { token, user } = await registerUser('customer');
    const res = await report({ subject: 'order', message: 'My bag was already gone.' }, token);
    expect(res.status).toBe(201);
    expect(ReportCreated.parse(await res.json()).reference).toMatch(/^R-\d{4}$/);
    expect(await stored(user.id)).toBe(1);
  });

  it('ties it to one of the reporter’s own orders', async () => {
    const { token, user } = await registerUser('customer');
    const store = await insertStore(freshCentre());
    const order = await insertOrder(user.id, await insertBag(store), store);
    const res = await report(
      { subject: 'order', orderId: order, message: 'The shop was closed at 18:10.' },
      token,
    );
    expect(res.status).toBe(201);
  });

  it('404s someone else’s order and stores nothing', async () => {
    const { token, user } = await registerUser('customer');
    const other = await registerUser('customer');
    const store = await insertStore(freshCentre());
    const theirs = await insertOrder(other.user.id, await insertBag(store), store);
    const res = await report(
      { subject: 'order', orderId: theirs, message: 'This is not my order at all.' },
      token,
    );
    expect(res.status).toBe(404);
    expect(await stored(user.id)).toBe(0);
  });

  it.each([
    ['a message under 10 characters', { subject: 'app', message: 'Broken' }],
    ['a message over 500 characters', { subject: 'app', message: 'x'.repeat(501) }],
    ['no subject', { message: 'The app keeps crashing.' }],
    ['an unknown subject', { subject: 'weather', message: 'The app keeps crashing.' }],
  ])('400s %s', async (_name, body) => {
    const { token } = await registerUser('customer');
    expect((await report(body, token)).status).toBe(400);
  });

  it('is open to shops too, and 401s without a token', async () => {
    const owner = await registerUser('store');
    expect(
      (await report({ subject: 'payment', message: 'A customer paid twice.' }, owner.token)).status,
    ).toBe(201);
    expect((await report({ subject: 'app', message: 'The app keeps crashing.' })).status).toBe(401);
  });

  it('retries a reference that’s already taken', async () => {
    const { user } = await registerUser('customer');
    const db = createDb(env.DB);
    const body = { subject: 'other' as const, message: 'Something else happened.' };
    // First draw 0.1234 → R-1234; the second report draws it again, then 0.4321.
    const draws = [0.1234, 0.1234, 0.4321];
    const random = () => draws.shift() ?? 0.9999;
    expect((await createReport(db, user.id, body, random)).reference).toBe('R-1234');
    expect((await createReport(db, user.id, body, random)).reference).toBe('R-4321');
  });
});
