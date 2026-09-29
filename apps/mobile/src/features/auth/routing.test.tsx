import type { Me } from '@leftover/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';
import { LOCATION_STORAGE_KEY } from '../../shared/store/location';
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
const owner: Me = {
  ...customer,
  id: 'u2',
  email: 'taras@example.com',
  firstName: 'Taras',
  role: 'store',
};
const ownerWithShop: Me = { ...owner, storeId: 's1' };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type Route = (url: string, init: RequestInit) => Response | undefined;
let fetchMock: jest.SpyInstance;
const serve = (route: Route) =>
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
    // Discover (06) loads bags on arrival; these tests only care about routing.
    const res = url.includes('/bags/nearby')
      ? json(200, { bags: [] })
      : url.endsWith('/me/stats')
        ? json(200, { bagsRescued: 0, savedMinor: 0 })
        : route(url, init);
    if (!res) throw new Error(`unexpected request ${init.method ?? 'GET'} ${url}`);
    return res;
  });

const storeSession = (user: Me, token = 'tok') =>
  SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify({ token, user }));

// A customer who has already chosen where to look (05), so they land on Discover.
const storeLocation = () =>
  AsyncStorage.setItem(
    LOCATION_STORAGE_KEY,
    JSON.stringify({
      state: {
        byUser: {
          [customer.id]: {
            selected: { label: 'Rynok Square 1', lat: 49.8419, lng: 24.0315 },
            radiusKm: 5,
            recent: [],
          },
        },
      },
      version: 2,
    }),
  );

const renderApp = () => renderRouter('./app', { initialUrl: '/' });

beforeEach(() => {
  useSession.setState({ status: 'hydrating', token: null, user: null });
  fetchMock = jest.spyOn(globalThis, 'fetch');
});
afterEach(() => fetchMock.mockRestore());

describe('auth routing', () => {
  it('shows Welcome when there is no stored session', async () => {
    serve(() => undefined);
    renderApp();
    expect(await screen.findByText('Good food deserves a second chance.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/welcome');
  });

  it('cold-starts a stored customer straight into Discover, without Welcome', async () => {
    await storeSession(customer);
    await storeLocation();
    serve((url) => (url.endsWith('/me') ? json(200, customer) : undefined));
    renderApp();
    await waitFor(() => expect(screen).toHavePathname('/discover'));
    expect(screen.queryByText('Good food deserves a second chance.')).toBeNull();
    expect(await screen.findByText('Rescue something tasty')).toBeOnTheScreen();
  });

  it('cold-starts a shop owner with a shop into Bags', async () => {
    await storeSession(ownerWithShop);
    serve((url) => (url.endsWith('/me') ? json(200, ownerWithShop) : undefined));
    renderApp();
    await waitFor(() => expect(screen).toHavePathname('/bags'));
  });

  it('always sends a shop owner without a shop to setup; the tabs are unreachable', async () => {
    await storeSession(owner);
    serve((url) => (url.endsWith('/me') ? json(200, owner) : undefined));
    renderRouter('./app', { initialUrl: '/store-orders' });
    await waitFor(() => expect(screen).toHavePathname('/setup'));
    expect(screen.getByText('Set up your shop')).toBeOnTheScreen();
  });

  it('keeps a set-up shop owner out of setup', async () => {
    await storeSession(ownerWithShop);
    serve((url) => (url.endsWith('/me') ? json(200, ownerWithShop) : undefined));
    renderRouter('./app', { initialUrl: '/setup' });
    await waitFor(() => expect(screen).toHavePathname('/bags'));
  });

  it('clears an expired token when a request 401s and shows Welcome', async () => {
    await storeSession(customer, 'expired');
    serve((url) =>
      url.endsWith('/me')
        ? json(401, { error: { code: 'unauthorized', message: 'x' } })
        : undefined,
    );
    renderApp();
    await waitFor(() => expect(screen).toHavePathname('/welcome'));
    expect(await SecureStore.getItemAsync(SESSION_STORAGE_KEY)).toBeNull();
    expect(useSession.getState().token).toBeNull();
  });

  it.each([
    ['customer', "I'm a customer", customer, '/location'],
    ['store', 'I run a shop', owner, '/setup'],
  ] as const)(
    'after registering as %s (%s) routes to onboarding',
    async (_role, radio, user, path) => {
      serve((url, init) => {
        if (url.endsWith('/auth/register') && init.method === 'POST')
          return json(201, { token: 'new', user });
        if (url.endsWith('/me')) return json(200, user);
        return undefined;
      });
      renderApp();
      await screen.findByText('Good food deserves a second chance.');
      fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
      await screen.findByText('Join Leftover');
      fireEvent.press(screen.getByRole('radio', { name: new RegExp(radio) }));
      fireEvent.changeText(screen.getByLabelText('First name'), user.firstName);
      fireEvent.changeText(screen.getByLabelText('Email'), user.email);
      fireEvent.changeText(screen.getByLabelText('Password'), 'leftover24');
      fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
      await waitFor(() => expect(screen).toHavePathname(path));
    },
  );

  it('logs out: revokes the token server-side, wipes the device and shows Welcome', async () => {
    await storeSession(customer, 'tok_live');
    await storeLocation();
    const calls: { url: string; auth: string | null }[] = [];
    serve((url, init) => {
      calls.push({ url, auth: new Headers(init.headers).get('Authorization') });
      if (url.endsWith('/me')) return json(200, customer);
      if (url.endsWith('/auth/logout')) return new Response(null, { status: 204 });
      return undefined;
    });
    // Customers log out from Profile (a placeholder until 15).
    renderRouter('./app', { initialUrl: '/profile' });
    await waitFor(() => expect(screen).toHavePathname('/profile'));
    fireEvent.press(await screen.findByRole('button', { name: 'Log out' }));
    // Confirm in the sheet (its button is the last "Log out").
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button', { name: 'Log out' }).at(-1) as never);
    });
    await waitFor(() => expect(screen).toHavePathname('/welcome'));
    expect(calls).toContainEqual({
      url: expect.stringMatching(/\/auth\/logout$/),
      auth: 'Bearer tok_live',
    });
    expect(await SecureStore.getItemAsync(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('keeps a customer out of the store group', async () => {
    await storeSession(customer);
    await storeLocation();
    serve((url) => (url.endsWith('/me') ? json(200, customer) : undefined));
    renderRouter('./app', { initialUrl: '/bags' });
    await waitFor(() => expect(screen).toHavePathname('/discover'));
  });
});
