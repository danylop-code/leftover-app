import * as Location from 'expo-location';
import { DEFAULT_API_URL } from '../constants/api';
import { SUGGEST_TIMEOUT_MS } from '../constants/location';
import { fetchAddressSuggestions } from './use-address-suggestions';

const near = { lat: 49.8419, lng: 24.0315 };
const suggestion = { id: 'N1', label: 'vul. Doroshenka 14', lat: 49.84, lng: 24.03 };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

let fetchMock: jest.SpyInstance;
beforeEach(() => {
  fetchMock = jest.spyOn(globalThis, 'fetch');
  (Location.geocodeAsync as jest.Mock).mockResolvedValue([{ latitude: 49.85, longitude: 24.02 }]);
});
afterEach(() => {
  fetchMock.mockRestore();
  jest.useRealTimers();
});

const signal = () => new AbortController().signal;

describe('fetchAddressSuggestions', () => {
  it('asks only our API — never the provider, and carries no provider key', async () => {
    fetchMock.mockResolvedValue(json(200, { results: [suggestion] }));
    expect(await fetchAddressSuggestions('Dorosh', near, signal())).toEqual([suggestion]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin).toBe(new URL(DEFAULT_API_URL).origin);
    expect(url.pathname).toBe('/geo/autocomplete');
    expect([...url.searchParams.keys()].sort()).toEqual(['lang', 'lat', 'lng', 'q']);
    expect(Location.geocodeAsync).not.toHaveBeenCalled();
  });

  it.each([
    ['the API is unreachable', () => fetchMock.mockRejectedValue(new TypeError('offline'))],
    [
      'the provider is down (502)',
      () =>
        fetchMock.mockResolvedValue(
          json(502, { error: { code: 'geo_unavailable', message: 'x' } }),
        ),
    ],
  ])('falls back to on-device geocoding when %s', async (_name, arrange) => {
    arrange();
    const results = await fetchAddressSuggestions('Rynok', near, signal());
    expect(Location.geocodeAsync).toHaveBeenCalledWith('Rynok');
    expect(results).toEqual([
      expect.objectContaining({ label: 'Rynok Square 1', lat: 49.85, lng: 24.02 }),
    ]);
  });

  it('falls back when the API is too slow', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init: RequestInit) =>
        new Promise((_resolve, reject) =>
          init.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    );
    const pending = fetchAddressSuggestions('Rynok', near, signal());
    jest.advanceTimersByTime(SUGGEST_TIMEOUT_MS);
    jest.useRealTimers();
    expect(await pending).toHaveLength(1);
  });

  it('does not fall back when the search itself was cancelled', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(
      (_url, init: RequestInit) =>
        new Promise((_resolve, reject) =>
          init.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    );
    const pending = fetchAddressSuggestions('Rynok', near, controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow('aborted');
    expect(Location.geocodeAsync).not.toHaveBeenCalled();
  });
});
