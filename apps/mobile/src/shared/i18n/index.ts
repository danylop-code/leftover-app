import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

export const resources = { en: { translation: en } } as const;

// English only for the MVP (see the roadmap's global out of scope). Synchronous init so the
// first render — and every test — already has strings.
i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  initAsync: false,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
