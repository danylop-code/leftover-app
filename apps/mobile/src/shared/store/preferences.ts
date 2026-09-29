import { Language } from '@leftover/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n from '../i18n';
import { deviceLanguage } from '../i18n/languages';

export const PREFERENCES_STORAGE_KEY = 'leftover.preferences';

// Device-wide display choices (not per account): they apply on the Welcome screen too.
type PreferencesState = {
  /** Chosen in Profile; null follows the phone's language. */
  language: Language | null;
  setLanguage: (language: Language) => void;
};

const Persisted = z.object({ language: Language.nullable() });

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Rehydrated by the app bootstrap, which holds the splash until it's done.
      skipHydration: true,
      partialize: ({ language }) => ({ language }),
      merge: (stored, current) => {
        const parsed = Persisted.safeParse(stored);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);

// i18next follows the preference (and the phone's language while none is chosen). Components
// using `useTranslation` re-render on the change; styles follow through `useTheme`.
usePreferences.subscribe((state, previous) => {
  if (state.language !== previous.language) {
    i18n.changeLanguage(state.language ?? deviceLanguage());
  }
});
