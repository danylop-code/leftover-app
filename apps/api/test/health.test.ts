import { env } from 'cloudflare:test';
import { Health } from '@leftover/shared';
import { describe, expect, it } from 'vitest';
import app from '../src/index';

describe('GET /health', () => {
  it('returns 200 { ok: true }', async () => {
    const res = await app.request('/health', {}, env);
    expect(res.status).toBe(200);
    expect(Health.parse(await res.json())).toEqual({ ok: true });
  });
});
