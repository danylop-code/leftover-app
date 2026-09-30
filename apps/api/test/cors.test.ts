import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import app from '../src/index';

const preflight = (origin: string) =>
  app.request(
    '/auth/login',
    {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
    },
    env,
  );

describe('CORS (web app, brief 17)', () => {
  it('lets the configured web dev origin call the API', async () => {
    const res = await preflight('http://localhost:8081');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8081');
    expect(res.headers.get('Access-Control-Allow-Headers')).toMatch(/Authorization/);
  });

  it('doesn’t allow other origins', async () => {
    const res = await preflight('https://evil.example');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
