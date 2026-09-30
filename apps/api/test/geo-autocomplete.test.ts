import { env } from 'cloudflare:test';
import { ApiError, AutocompleteResponse } from '@leftover/shared';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { jsonRequest, registerUser } from './helpers/auth';

// Photon GeoJSON features, trimmed to the properties the adapter reads.
const feature = (id: number, [lng, lat]: [number, number], properties: Record<string, string>) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { osm_type: 'N', osm_id: id, country: 'Ukraine', city: 'Lviv', ...properties },
});

const far = feature(1, [24.06, 49.85], { street: 'vulytsia Doroshenka', housenumber: '45' });
const near = feature(2, [24.0299, 49.8399], { street: 'vulytsia Doroshenka', housenumber: '14' });
const stop = feature(3, [24.031, 49.841], { name: 'Doroshenka', street: 'vulytsia Doroshenka' });
const duplicate = feature(4, [24.03, 49.84], { street: 'vulytsia Doroshenka', housenumber: '14' });

const pin = { lat: '49.8397', lng: '24.0297' };

const photon = (features: unknown[], status = 200) =>
  new Response(JSON.stringify({ type: 'FeatureCollection', features }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const autocomplete = (query: Record<string, string>, token?: string) =>
  jsonRequest(`/geo/autocomplete?${new URLSearchParams(query)}`, 'GET', undefined, token);

let fetchSpy: MockInstance<typeof fetch>;
beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, 'fetch');
});
afterEach(() => fetchSpy.mockRestore());

describe('GET /geo/autocomplete', () => {
  it('returns suggestions nearest to the pin first, with coordinates and labels', async () => {
    fetchSpy.mockResolvedValue(photon([far, stop, near]));
    const { token } = await registerUser('customer');
    const res = await autocomplete({ q: 'Dorosh', ...pin }, token);
    expect(res.status).toBe(200);
    const { results } = AutocompleteResponse.parse(await res.json());
    expect(results.map((r) => r.label)).toEqual([
      'vulytsia Doroshenka 14',
      'Doroshenka',
      'vulytsia Doroshenka 45',
    ]);
    expect(results[0]).toEqual({
      id: 'N2',
      label: 'vulytsia Doroshenka 14',
      secondary: 'Lviv, Ukraine',
      lat: 49.8399,
      lng: 24.0299,
    });
    expect(results[1]?.secondary).toBe('vulytsia Doroshenka, Lviv, Ukraine');
  });

  it('asks the configured provider, biased to the pin, and sends it no credentials', async () => {
    fetchSpy.mockResolvedValue(photon([]));
    const { token } = await registerUser('customer');
    await autocomplete({ q: 'Dorosh', ...pin }, token);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [input, init] = fetchSpy.mock.calls[0] ?? [];
    const url = new URL(String(input));
    expect(`${url.origin}${url.pathname}`).toBe(`${env.PHOTON_URL}/api/`);
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      q: 'Dorosh',
      lat: pin.lat,
      lon: pin.lng,
    });
    expect(new Headers(init?.headers).get('Authorization')).toBeNull();
  });

  it('drops repeated addresses and repeated places', async () => {
    const sameObject = feature(2, [24.0299, 49.8399], { name: 'Doroshenka' });
    fetchSpy.mockResolvedValue(photon([near, duplicate, sameObject]));
    const { token } = await registerUser('customer');
    const { results } = AutocompleteResponse.parse(
      await (await autocomplete({ q: 'Dorosh', ...pin }, token)).json(),
    );
    expect(results).toHaveLength(1);
  });

  it('is open to shop owners too (shop setup uses it)', async () => {
    fetchSpy.mockResolvedValue(photon([near]));
    const { token } = await registerUser('store');
    expect((await autocomplete({ q: 'Dorosh' }, token)).status).toBe(200);
  });

  it('401s without a token and never calls the provider', async () => {
    const res = await autocomplete({ q: 'Dorosh' });
    expect(res.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('400s a too-short query or a half bias point', async () => {
    const { token } = await registerUser('customer');
    const short = await autocomplete({ q: 'D' }, token);
    expect(short.status).toBe(400);
    expect(ApiError.parse(await short.json()).error.fields).toHaveProperty('q');
    expect((await autocomplete({ q: 'Dorosh', lat: '49.8' }, token)).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['answers 5xx', () => fetchSpy.mockResolvedValue(photon([], 503))],
    ['is unreachable or times out', () => fetchSpy.mockRejectedValue(new Error('timeout'))],
    [
      'answers something unexpected',
      () => fetchSpy.mockResolvedValue(new Response('<html>', { status: 200 })),
    ],
  ])('502s geo_unavailable when the provider %s', async (_name, arrange) => {
    arrange();
    const { token } = await registerUser('customer');
    const res = await autocomplete({ q: 'Dorosh' }, token);
    expect(res.status).toBe(502);
    expect(ApiError.parse(await res.json()).error.code).toBe('geo_unavailable');
  });
});

describe('GET /geo/reverse', () => {
  const reverse = (query: Record<string, string>, token?: string) =>
    jsonRequest(`/geo/reverse?${new URLSearchParams(query)}`, 'GET', undefined, token);

  it('labels the point, keeping the point itself', async () => {
    fetchSpy.mockResolvedValue(photon([near]));
    const { token } = await registerUser('customer');
    const res = await reverse(pin, token);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      place: {
        label: 'vulytsia Doroshenka 14',
        secondary: 'Lviv, Ukraine',
        lat: Number(pin.lat),
        lng: Number(pin.lng),
      },
    });
    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(url.pathname).toBe('/reverse');
    expect(url.searchParams.get('lon')).toBe(pin.lng);
  });

  it('answers null when nothing is near, 502 when the provider fails, 401 without a token', async () => {
    const { token } = await registerUser('customer');
    fetchSpy.mockResolvedValue(photon([]));
    expect(await (await reverse(pin, token)).json()).toEqual({ place: null });
    fetchSpy.mockRejectedValue(new Error('timeout'));
    expect((await reverse(pin, token)).status).toBe(502);
    expect((await reverse(pin)).status).toBe(401);
  });
});
