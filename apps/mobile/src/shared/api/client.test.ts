import { z } from 'zod';
import { useSession } from '../store/session';
import { ApiError, apiRequest, NetworkError, NoContent, ParseError } from './client';

const Thing = z.object({ id: z.string(), priceMinor: z.number().int() });

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

let fetchMock: jest.SpyInstance;

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_URL = 'https://api.test';
  useSession.getState().clear();
  fetchMock = jest.spyOn(globalThis, 'fetch');
});

afterEach(() => fetchMock.mockRestore());

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return { url, init, headers: new Headers(init.headers) };
};

describe('apiRequest', () => {
  it('sends the bearer token from the session store', async () => {
    useSession.getState().setToken('tok_123');
    fetchMock.mockResolvedValue(json(200, { id: 'a', priceMinor: 14900 }));
    await apiRequest('/things/a', { schema: Thing });
    const { url, headers } = lastCall();
    expect(url).toBe('https://api.test/things/a');
    expect(headers.get('Authorization')).toBe('Bearer tok_123');
  });

  it('sends no Authorization header without a session', async () => {
    fetchMock.mockResolvedValue(json(200, { id: 'a', priceMinor: 1 }));
    await apiRequest('/things/a', { schema: Thing });
    expect(lastCall().headers.has('Authorization')).toBe(false);
  });

  it('serialises JSON bodies and query params', async () => {
    fetchMock.mockResolvedValue(json(201, { id: 'b', priceMinor: 2 }));
    await apiRequest('/things', {
      method: 'POST',
      body: { qty: 2 },
      query: { lat: 49.84, radiusKm: 5, category: undefined },
      schema: Thing,
    });
    const { url, init, headers } = lastCall();
    expect(url).toBe('https://api.test/things?lat=49.84&radiusKm=5');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"qty":2}');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('returns data parsed by the schema (unknown keys stripped)', async () => {
    fetchMock.mockResolvedValue(json(200, { id: 'a', priceMinor: 14900, extra: true }));
    await expect(apiRequest('/things/a', { schema: Thing })).resolves.toEqual({
      id: 'a',
      priceMinor: 14900,
    });
  });

  it('rejects with a ParseError when the response does not match the schema', async () => {
    fetchMock.mockResolvedValue(json(200, { id: 'a', priceMinor: 149.5 }));
    const err = await apiRequest('/things/a', { schema: Thing }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ParseError);
    expect((err as ParseError).path).toBe('/things/a');
  });

  it('rejects with a ParseError when the body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }));
    await expect(apiRequest('/things/a', { schema: Thing })).rejects.toBeInstanceOf(ParseError);
  });

  it('turns the error envelope into a typed ApiError', async () => {
    fetchMock.mockResolvedValue(
      json(409, { error: { code: 'sold_out', message: 'Just sold out', qtyAvailable: 0 } }),
    );
    const err = await apiRequest('/orders', { method: 'POST', schema: Thing }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'sold_out', message: 'Just sold out' });
    expect((err as ApiError).details).toMatchObject({ qtyAvailable: 0 });
  });

  it('keeps per-field validation messages', async () => {
    fetchMock.mockResolvedValue(
      json(400, {
        error: { code: 'validation', message: 'Invalid', fields: { email: ['Invalid email'] } },
      }),
    );
    const err = (await apiRequest('/auth/register', { method: 'POST', schema: Thing }).catch(
      (e: unknown) => e,
    )) as ApiError;
    expect(err.fields).toEqual({ email: ['Invalid email'] });
  });

  it('maps a non-envelope error response to ApiError code unknown', async () => {
    fetchMock.mockResolvedValue(new Response('Bad gateway', { status: 502 }));
    await expect(apiRequest('/things', { schema: Thing })).rejects.toMatchObject({
      status: 502,
      code: 'unknown',
    });
  });

  it('rejects with a NetworkError when fetch fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expect(apiRequest('/things', { schema: Thing })).rejects.toBeInstanceOf(NetworkError);
  });

  it('resolves undefined for 204 with the NoContent schema', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(
      apiRequest('/favorites/s1', { method: 'PUT', schema: NoContent }),
    ).resolves.toBeUndefined();
  });
});
