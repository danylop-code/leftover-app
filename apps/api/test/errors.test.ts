import { env } from 'cloudflare:test';
import { ApiError } from '@leftover/shared';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import app from '../src/index';
import type { AppEnv } from '../src/lib/env';
import { conflict, installErrorHandling, notFound } from '../src/lib/errors';
import { validate } from '../src/lib/validate';

// Test-only routes, wired with the same error handling as the real app.
const testApp = new Hono<AppEnv>();
installErrorHandling(testApp);
testApp.post(
  '/echo',
  validate('json', z.object({ qty: z.number().int().min(1).max(5), note: z.string().optional() })),
  (c) => c.json(c.req.valid('json')),
);
testApp.get('/items', validate('query', z.object({ radiusKm: z.coerce.number().min(1) })), (c) =>
  c.json(c.req.valid('query')),
);
testApp.get('/boom', () => {
  throw new Error('D1_ERROR: secret table detail');
});
testApp.get('/sold-out', () => {
  throw conflict('sold_out', 'Just sold out', { qtyAvailable: 0 });
});
testApp.get('/missing', () => {
  throw notFound('No such store');
});

const body = async (res: Response) => ApiError.parse(await res.json());

const post = (path: string, payload: string) =>
  testApp.request(
    path,
    { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' } },
    env,
  );

describe('error envelope', () => {
  it('404s unknown routes on the real app with code not_found', async () => {
    const res = await app.request('/nope', {}, env);
    expect(res.status).toBe(404);
    expect((await body(res)).error.code).toBe('not_found');
  });

  it('400s a body that fails the schema, with per-field messages', async () => {
    const res = await post('/echo', JSON.stringify({ qty: 9, note: 3 }));
    expect(res.status).toBe(400);
    const { error } = await body(res);
    expect(error.code).toBe('validation');
    expect(Object.keys(error.fields ?? {}).sort()).toEqual(['note', 'qty']);
    expect(error.fields?.qty?.[0]).toBeTruthy();
  });

  it('400s malformed JSON as validation', async () => {
    const res = await post('/echo', '{"qty": ');
    expect(res.status).toBe(400);
    expect((await body(res)).error.code).toBe('validation');
  });

  it('validates query strings too', async () => {
    const res = await testApp.request('/items?radiusKm=0', {}, env);
    expect(res.status).toBe(400);
    expect((await body(res)).error.fields).toHaveProperty('radiusKm');
  });

  it('passes parsed data through when valid', async () => {
    const res = await post('/echo', JSON.stringify({ qty: 2 }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ qty: 2 });
  });

  it('maps domain errors to their status and code, with extra details', async () => {
    const res = await testApp.request('/sold-out', {}, env);
    expect(res.status).toBe(409);
    const json = (await res.json()) as { error: { code: string; qtyAvailable: number } };
    expect(json.error.code).toBe('sold_out');
    expect(json.error.qtyAvailable).toBe(0);
    const missing = await testApp.request('/missing', {}, env);
    expect(missing.status).toBe(404);
    expect((await body(missing)).error.code).toBe('not_found');
  });

  it('500s unexpected errors as internal without leaking details', async () => {
    const res = await testApp.request('/boom', {}, env);
    expect(res.status).toBe(500);
    const text = await res.text();
    const { error } = ApiError.parse(JSON.parse(text));
    expect(error.code).toBe('internal');
    expect(text).not.toMatch(/secret|D1_ERROR|stack|at /);
  });
});
