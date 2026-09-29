import { Session } from '@leftover/shared';
import * as SecureStore from 'expo-secure-store';

export const SESSION_STORAGE_KEY = 'leftover.session';

/** The persisted session, or null when missing or unreadable (a corrupt entry is removed). */
export const loadSession = async (): Promise<Session | null> => {
  const raw = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = Session.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    // fall through
  }
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
  return null;
};

export const saveSession = (session: Session) =>
  SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));

export const clearSession = () => SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
