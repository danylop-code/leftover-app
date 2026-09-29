import type { Me } from '@leftover/shared';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';
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
};
const owner: Me = {
  ...customer,
  id: 'u2',
  email: 'taras@example.com',
  firstName: 'Taras',
  role: 'store',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type Route = (url: string, init: RequestInit) => Response | undefined;
let fetchMock: jest.SpyInstance;
const serve = (route: Route) =>
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
    const res = route(url, init);
    if (!res) throw new Error(`unexpected request ${init.method ?? 'GET'} ${url}`);
    return res;
  });

const storeSession = (user: Me, token = 'tok') =>
  SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify({ token, user }));

const renderApp = () => renderRouter('./app', { initialUrl: '/' });

beforeEach(() => {
  useSession.setState({ status: 'hydrating', token: null, user: null, justRegistered: false });
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
    serve((url) => (url.endsWith('/me') ? json(200, customer) : undefined));
    renderApp();
    await waitFor(() => expect(screen).toHavePathname('/discover'));
    expect(screen.queryByText('Good food deserves a second chance.')).toBeNull();
    expect(screen.getByText('Signed in as Olena · olena@example.com')).toBeOnTheScreen();
  });

  it('cold-starts a stored shop owner into Bags', async () => {
    await storeSession(owner);
    serve((url) => (url.endsWith('/me') ? json(200, owner) : undefined));
    renderApp();
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
    const calls: { url: string; auth: string | null }[] = [];
    serve((url, init) => {
      calls.push({ url, auth: new Headers(init.headers).get('Authorization') });
      if (url.endsWith('/me')) return json(200, customer);
      if (url.endsWith('/auth/logout')) return new Response(null, { status: 204 });
      return undefined;
    });
    renderApp();
    await waitFor(() => expect(screen).toHavePathname('/discover'));
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
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
    serve((url) => (url.endsWith('/me') ? json(200, customer) : undefined));
    renderRouter('./app', { initialUrl: '/bags' });
    await waitFor(() => expect(screen).toHavePathname('/discover'));
  });
});
