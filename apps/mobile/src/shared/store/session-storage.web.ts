import { Session } from '@leftover/shared';

// Web (brief 17): there's no keychain in a browser, so the session lives in localStorage.
// A demo trade-off: any script on the page could read the token.
export const SESSION_STORAGE_KEY = 'leftover.session';

/** The persisted session, or null when missing or unreadable (a corrupt entry is removed). */
export const loadSession = async (): Promise<Session | null> => {
  const raw = globalThis.localStorage?.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = Session.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    // fall through
  }
  globalThis.localStorage?.removeItem(SESSION_STORAGE_KEY);
  return null;
};

export const saveSession = async (session: Session) => {
  globalThis.localStorage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = async () => {
  globalThis.localStorage?.removeItem(SESSION_STORAGE_KEY);
};
