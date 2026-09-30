import type { Me } from '@leftover/shared';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';
import { useSession } from '../../shared/store/session';
import { SESSION_STORAGE_KEY } from '../../shared/store/session-storage';
import { pickTime } from '../../shared/testing/pick-time';

jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: () => [true, null],
}));

const owner: Me = {
  id: 'u2',
  email: 'taras@example.com',
  firstName: 'Taras',
  role: 'store',
  createdAt: '2026-09-29T10:00:00.000Z',
  storeId: null,
};

const store = {
  id: 's9',
  name: 'Crumb & Co. Bakery',
  category: 'bakery',
  address: 'vul. Doroshenka 32',
  lat: 49.8393,
  lng: 24.0325,
  opensAt: '08:00',
  closesAt: '20:00',
  timezone: 'Europe/Kyiv',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('shop setup routing', () => {
  it('saving the shop lands the owner on My bags, and a restart stays there', async () => {
    useSession.setState({ status: 'hydrating', token: null, user: null });
    await SecureStore.setItemAsync(
      SESSION_STORAGE_KEY,
      JSON.stringify({ token: 'tok', user: owner }),
    );
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      // Check /stores/me first: it also ends with /me.
      if (String(url).endsWith('/stores/me') && init?.method === 'POST') return json(201, store);
      if (String(url).includes('/geo/autocomplete'))
        return json(200, {
          results: [{ id: 'N32', label: store.address, lat: store.lat, lng: store.lng }],
        });
      if (String(url).endsWith('/me')) return json(200, owner);
      throw new Error(`unexpected ${String(url)}`);
    });

    renderRouter('./app', { initialUrl: '/' });
    await waitFor(() => expect(screen).toHavePathname('/setup'));
    fireEvent.changeText(screen.getByLabelText('Shop name'), store.name);
    fireEvent.press(screen.getByRole('button', { name: 'Bakery' }));
    fireEvent.changeText(screen.getByLabelText('Address'), 'Dorosh');
    const suggestion = await screen.findByRole('button', { name: /vul\. Doroshenka 32/ });
    await act(async () => {
      fireEvent.press(suggestion);
    });
    // Picking closes the list (let React Query's batched notify land inside the test).
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /vul\. Doroshenka 32/ })).toBeNull(),
    );
    await pickTime('Opens at', '08:00');
    await pickTime('Closes at', '20:00');
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Save and continue' }));
    });

    await waitFor(() => expect(screen).toHavePathname('/bags'));
    const stored = JSON.parse((await SecureStore.getItemAsync(SESSION_STORAGE_KEY)) ?? '{}');
    expect(stored.user.storeId).toBe('s9');
    fetchMock.mockRestore();
  });
});
