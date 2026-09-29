import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { deviceLanguage } from './languages';
import ar from './locales/ar.json';
import en from './locales/en.json';
import { installPluralRules } from './plural-rules';

installPluralRules();

export const resources = { en: { translation: en }, ar: { translation: ar } } as const;

// Synchronous init so the first render — and every test — already has strings. Starts in the
// phone's language; a choice saved in Profile is applied when preferences load (`useLanguage`).
i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'ar'],
  initAsync: false,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
