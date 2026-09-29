import { Language } from '@leftover/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n from '../i18n';
import { deviceLanguage } from '../i18n/languages';

export const PREFERENCES_STORAGE_KEY = 'leftover.preferences';

export const Appearance = z.enum(['system', 'light', 'dark']);
export type Appearance = z.infer<typeof Appearance>;

// Device-wide display choices (not per account): they apply on the Welcome screen too.
type PreferencesState = {
  /** Chosen in Profile; null follows the phone's language. */
  language: Language | null;
  /** Light, dark, or the phone's setting (brief 19). */
  appearance: Appearance;
  setLanguage: (language: Language) => void;
  setAppearance: (appearance: Appearance) => void;
};

// Older saved entries have no appearance: they get System.
const Persisted = z.object({
  language: Language.nullable(),
  appearance: Appearance.default('system'),
});

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      language: null,
      appearance: 'system',
      setLanguage: (language) => set({ language }),
      setAppearance: (appearance) => set({ appearance }),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Rehydrated by the app bootstrap, which holds the splash until it's done.
      skipHydration: true,
      partialize: ({ language, appearance }) => ({ language, appearance }),
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
