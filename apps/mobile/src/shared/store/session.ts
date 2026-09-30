import type { Me, Session } from '@leftover/shared';
import { create } from 'zustand';
import { useLocation } from './location';
import { clearSession, loadSession, saveSession } from './session-storage';

// Client state only: who is signed in and with which token. Persisted in expo-secure-store so
// a cold start can route to the role's home before any network call.
type SessionState = {
  status: 'hydrating' | 'signedOut' | 'signedIn';
  token: string | null;
  user: Me | null;
  hydrate: () => Promise<void>;
  signIn: (session: Session) => Promise<void>;
  /** Refreshes the cached user (from GET /me). */
  setUser: (user: Me) => Promise<void>;
  signOut: () => Promise<void>;
};

const signedOut = { status: 'signedOut', token: null, user: null } as const;

export const useSession = create<SessionState>()((set, get) => ({
  status: 'hydrating',
  token: null,
  user: null,
  hydrate: async () => {
    const stored = await loadSession();
    useLocation.getState().switchUser(stored?.user.id ?? null);
    set(stored ? { status: 'signedIn', ...stored } : signedOut);
  },
  signIn: async (session) => {
    useLocation.getState().switchUser(session.user.id);
    set({ status: 'signedIn', ...session });
    await saveSession(session);
  },
  setUser: async (user) => {
    const { token } = get();
    if (!token) return;
    set({ user });
    await saveSession({ token, user });
  },
  signOut: async () => {
    useLocation.getState().switchUser(null);
    set(signedOut);
    await clearSession();
  },
}));
