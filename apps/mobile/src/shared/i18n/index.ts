import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isolate } from './bidi';
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
  // React escapes for us, so "escaping" is used for bidi only: in Arabic every value (a Latin
  // shop name, an address, a price) is isolated so it can't reorder the sentence around it.
  interpolation: {
    escapeValue: true,
    escape: (value: string) => (i18n.language === 'ar' ? isolate(value) : value),
  },
  returnNull: false,
});

export default i18n;
