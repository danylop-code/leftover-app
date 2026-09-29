import type { Language } from '@leftover/shared';
import { getLocales } from 'expo-localization';

export const LANGUAGES: readonly Language[] = ['en', 'ar'];

/** Each language's name in itself, for the picker (not translated on purpose). */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', ar: 'العربية' };

const RTL_LANGUAGES: readonly Language[] = ['ar'];

export type Direction = 'ltr' | 'rtl';

export const directionOf = (language: Language): Direction =>
  RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';

/** The phone's first language when the app has it, else English. */
export const deviceLanguage = (): Language => {
  const code = getLocales()[0]?.languageCode;
  return LANGUAGES.find((l) => l === code) ?? 'en';
};

/**
 * `Intl` locale for day and month names. Oman writes Western digits (brief 21), and not every
 * runtime honours `-u-nu-latn`, so callers still pass results through `westernDigits`.
 */
export const INTL_LOCALE: Record<Language, string> = { en: 'en-US', ar: 'ar-OM-u-nu-latn' };

const ARABIC_INDIC_ZERO = 0x0660;

/** `٢٦` → `26`. */
export const westernDigits = (text: string): string =>
  text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - ARABIC_INDIC_ZERO));
