import type { Me } from '@leftover/shared';
import * as SecureStore from 'expo-secure-store';
import { useSession } from './session';
import { SESSION_STORAGE_KEY } from './session-storage';

const user: Me = {
  id: 'u1',
  email: 'olena@example.com',
  firstName: 'Olena',
  role: 'customer',
  createdAt: '2026-09-29T10:00:00.000Z',
  storeId: null,
};

beforeEach(() => useSession.setState({ status: 'hydrating', token: null, user: null }));

describe('session store', () => {
  it('hydrates to signedOut when nothing is stored', async () => {
    await useSession.getState().hydrate();
    expect(useSession.getState()).toMatchObject({ status: 'signedOut', token: null, user: null });
  });

  it('hydrates a stored session without a network call', async () => {
    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify({ token: 'tok', user }));
    await useSession.getState().hydrate();
    expect(useSession.getState()).toMatchObject({ status: 'signedIn', token: 'tok', user });
  });

  it('treats a corrupt stored session as signed out and removes it', async () => {
    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, '{"token":1}');
    await useSession.getState().hydrate();
    expect(useSession.getState().status).toBe('signedOut');
    expect(await SecureStore.getItemAsync(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('persists on sign-in and wipes on sign-out', async () => {
    await useSession.getState().signIn({ token: 'tok', user });
    expect(useSession.getState()).toMatchObject({ status: 'signedIn', token: 'tok', user });
    expect(JSON.parse((await SecureStore.getItemAsync(SESSION_STORAGE_KEY)) ?? '')).toEqual({
      token: 'tok',
      user,
    });

    await useSession.getState().signOut();
    expect(useSession.getState()).toMatchObject({ status: 'signedOut', token: null, user: null });
    expect(await SecureStore.getItemAsync(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('updates the stored user after a /me refresh', async () => {
    await useSession.getState().signIn({ token: 'tok', user });
    await useSession.getState().setUser({ ...user, firstName: 'Olenka' });
    const stored = JSON.parse((await SecureStore.getItemAsync(SESSION_STORAGE_KEY)) ?? '');
    expect(stored.user.firstName).toBe('Olenka');
  });
});
