import { env } from 'cloudflare:test';
import { NearbyResponse, Session } from '@leftover/shared';
import { describe, expect, it } from 'vitest';
import lvivSql from '../seed/dev.sql?raw';
import omanSql from '../seed/oman.sql?raw';
import { jsonRequest } from './helpers/auth';
import { runSql } from './helpers/run-sql';

const seedStores = () =>
  env.DB.prepare("SELECT name, timezone FROM stores WHERE id LIKE 'seed-%' ORDER BY name").all<{
    name: string;
    timezone: string;
  }>();

describe('Oman seed', () => {
  it('loads Muscat shops in Asia/Muscat, replacing the Lviv seed', async () => {
    await runSql(env.DB, lvivSql);
    await runSql(env.DB, omanSql);
    const { results } = await seedStores();
    expect(results.map((r) => r.name)).toEqual([
      'Dar Al Qahwa Café',
      'Khuwair Kitchen',
      'Qurum Crust Bakery',
      'Ruwi Green Market',
      'Shatti Grocery',
    ]);
    expect(results.every((r) => r.timezone === 'Asia/Muscat')).toBe(true);
  });

  it('is idempotent and prices bags in integer baisa', async () => {
    await runSql(env.DB, omanSql);
    await runSql(env.DB, omanSql);
    const bags = await env.DB.prepare(
      "SELECT price_minor, original_price_minor, typeof(price_minor) AS t FROM bags WHERE id LIKE 'seed-%'",
    ).all<{ price_minor: number; original_price_minor: number; t: string }>();
    expect(bags.results).toHaveLength(9);
    for (const b of bags.results) {
      expect(b.t).toBe('integer');
      // OMR 0.500–10.000: baisa, not kopiyky.
      expect(b.price_minor).toBeGreaterThanOrEqual(500);
      expect(b.original_price_minor).toBeLessThanOrEqual(10000);
      expect(b.price_minor).toBeLessThan(b.original_price_minor);
    }
  });

  it('shows the demo bags near Qurum within 5 km, nearest first, in Asia/Muscat', async () => {
    await runSql(env.DB, omanSql);
    const login = await jsonRequest('/auth/login', 'POST', {
      email: 'aisha@seed.leftover.app',
      password: 'leftover24',
    });
    expect(login.status).toBe(200);
    const { token } = Session.parse(await login.json());
    const res = await jsonRequest(
      '/bags/nearby?lat=23.6139&lng=58.4757&radiusKm=5',
      'GET',
      undefined,
      token,
    );
    const { bags } = NearbyResponse.parse(await res.json());
    const seeded = bags.filter((b) => b.id.startsWith('seed-'));
    // Sold-out bread, the paused sandwich bag, the past morning bag and Ruwi (7 km) are out.
    expect(seeded.map((b) => b.id)).toEqual([
      'seed-bag-qurum-surprise',
      'seed-bag-qurum-sweet',
      'seed-bag-shatti-groceries',
      'seed-bag-qahwa-pastry',
      'seed-bag-khuwair-hot',
    ]);
    expect(seeded.every((b) => b.store.timezone === 'Asia/Muscat')).toBe(true);
    expect(seeded[0]).toMatchObject({ priceMinor: 1500, originalPriceMinor: 4500 });
  });
});
