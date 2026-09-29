import type { Me, Place } from '@leftover/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';
import { LOCATION_STORAGE_KEY, useLocation } from '../../shared/store/location';
import { useSession } from '../../shared/store/session';
import { SESSION_STORAGE_KEY } from '../../shared/store/session-storage';

jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: () => [true, null],
}));

const customer: Me = {
  id: 'u1',
  email: 'olena@example.com',
  firstName: 'Olena',
  role: 'customer',
  createdAt: '2026-09-29T10:00:00.000Z',
  storeId: null,
};
const dorosh: Place = { label: 'vul. Doroshenka 14', lat: 49.8399, lng: 24.0299 };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

let fetchMock: jest.SpyInstance;

const start = async (initialUrl = '/', location?: { selected: Place; radiusKm: number }) => {
  await SecureStore.setItemAsync(
    SESSION_STORAGE_KEY,
    JSON.stringify({ token: 'tok', user: customer }),
  );
  if (location) {
    await AsyncStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({ state: { ...location, recent: [] }, version: 1 }),
    );
  }
  renderRouter('./app', { initialUrl });
};

beforeEach(() => {
  useSession.setState({ status: 'hydrating', token: null, user: null });
  fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (String(url).endsWith('/auth/logout')) return new Response(null, { status: 204 });
    if (String(url).endsWith('/me/stats')) return json(200, { bagsRescued: 0, savedMinor: 0 });
    if (String(url).endsWith('/me')) return json(200, customer);
    if (String(url).includes('/bags/nearby')) return json(200, { bags: [] });
    throw new Error(`unexpected ${init?.method ?? 'GET'} ${String(url)}`);
  });
});
afterEach(() => fetchMock.mockRestore());

describe('location routing', () => {
  it('sends a customer without a location to Location; Discover is unreachable', async () => {
    await start('/discover');
    await waitFor(() => expect(screen).toHavePathname('/location'));
    expect(screen.getByText('Where should we look?')).toBeOnTheScreen();
  });

  it('“Show results” unlocks Discover', async () => {
    await start();
    await waitFor(() => expect(screen).toHavePathname('/location'));
    const show = screen.getByRole('button', { name: 'Show results' });
    await waitFor(() => expect(show).toBeEnabled());
    await act(async () => {
      fireEvent.press(show);
    });
    await waitFor(() => expect(screen).toHavePathname('/discover'));
  });

  it('restores the last location and radius after a restart and opens Discover', async () => {
    await start('/', { selected: dorosh, radiusKm: 12 });
    await waitFor(() => expect(screen).toHavePathname('/discover'));
    expect(useLocation.getState()).toMatchObject({ selected: dorosh, radiusKm: 12 });
  });

  it('forgets the location on logout, so the next account starts at Location', async () => {
    await start('/profile', { selected: dorosh, radiusKm: 12 });
    await waitFor(() => expect(screen).toHavePathname('/profile'));
    fireEvent.press(await screen.findByRole('button', { name: 'Log out' }));
    // Confirm in the sheet (its button is the last "Log out").
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button', { name: 'Log out' }).at(-1) as never);
    });
    await waitFor(() => expect(screen).toHavePathname('/welcome'));
    expect(useLocation.getState().selected).toBeNull();
    const stored = JSON.parse((await AsyncStorage.getItem(LOCATION_STORAGE_KEY)) ?? '{}');
    expect(stored.state.selected).toBeNull();
  });
});
