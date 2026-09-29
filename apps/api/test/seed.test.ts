import { env } from 'cloudflare:test';
import { NearbyResponse, Session } from '@leftover/shared';
import { describe, expect, it } from 'vitest';
import seedSql from '../seed/dev.sql?raw';
import { jsonRequest } from './helpers/auth';
import { runSql } from './helpers/run-sql';

describe('dev seed', () => {
  it('applies on a migrated D1 and the seed stores are queryable', async () => {
    await runSql(env.DB, seedSql);
    const { results } = await env.DB.prepare(
      "SELECT name, timezone FROM stores WHERE id LIKE 'seed-%' ORDER BY name",
    ).all<{ name: string; timezone: string }>();
    expect(results.map((r) => r.name)).toEqual([
      'Crumb & Co. Bakery',
      'Green Row Market',
      'Kasha Kitchen',
      'Morning Proof Café',
      'Zelena Grocery',
    ]);
    expect(results.every((r) => r.timezone === 'Europe/Kyiv')).toBe(true);
  });

  it('is idempotent and stores money as integer kopiyky', async () => {
    await runSql(env.DB, seedSql);
    await runSql(env.DB, seedSql);
    const bags = await env.DB.prepare(
      "SELECT price_minor, original_price_minor, typeof(price_minor) AS t FROM bags WHERE id LIKE 'seed-%'",
    ).all<{ price_minor: number; original_price_minor: number; t: string }>();
    expect(bags.results).toHaveLength(9);
    for (const b of bags.results) {
      expect(b.t).toBe('integer');
      expect(b.price_minor).toBeLessThan(b.original_price_minor);
    }
  });

  it('enforces the stock range check', async () => {
    await runSql(env.DB, seedSql);
    await expect(
      env.DB.prepare(
        "UPDATE bags SET qty_available = -1 WHERE id = 'seed-bag-crumb-surprise'",
      ).run(),
    ).rejects.toThrow(/CHECK constraint failed/);
  });
});

describe('dev seed demo logins', () => {
  it('logs in the demo customer with leftover24', async () => {
    await runSql(env.DB, seedSql);
    const res = await jsonRequest('/auth/login', 'POST', {
      email: 'olena@seed.leftover.app',
      password: 'leftover24',
    });
    expect(res.status).toBe(200);
    expect(Session.parse(await res.json()).user.role).toBe('customer');
  });
});

describe('dev seed on Discover', () => {
  it('shows the demo bags from vul. Doroshenka 14 within 5 km, nearest first', async () => {
    await runSql(env.DB, seedSql);
    const login = await jsonRequest('/auth/login', 'POST', {
      email: 'olena@seed.leftover.app',
      password: 'leftover24',
    });
    const { token } = Session.parse(await login.json());
    const res = await jsonRequest(
      '/bags/nearby?lat=49.8421&lng=24.0224&radiusKm=5',
      'GET',
      undefined,
      token,
    );
    const { bags } = NearbyResponse.parse(await res.json());
    // Sold-out bread, the paused sandwich bag, the past morning bag and Green Row (6 km) are out.
    expect(bags.map((b) => b.id).filter((id) => id.startsWith('seed-'))).toEqual([
      'seed-bag-crumb-surprise',
      'seed-bag-crumb-sweet',
      'seed-bag-morning-pastry',
      'seed-bag-kasha-hot',
      'seed-bag-zelena-groceries',
    ]);
  });
});
