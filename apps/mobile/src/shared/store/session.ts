import { create } from 'zustand';

// Client-side session. Feature 03 (auth) adds the user, persistence in expo-secure-store and the
// 401 handling; the API client only needs the bearer token.
type SessionState = {
  token: string | null;
  setToken: (token: string) => void;
  clear: () => void;
};

export const useSession = create<SessionState>()((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  clear: () => set({ token: null }),
}));
