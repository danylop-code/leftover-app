import type { Language } from '@leftover/shared';
import { usePreferences } from '../store/preferences';
import { type Direction, deviceLanguage, directionOf } from './languages';

/** The language in use: the one chosen in Profile, else the phone's. */
export const effectiveLanguage = (chosen: Language | null): Language => chosen ?? deviceLanguage();

export const useLanguage = (): { language: Language; direction: Direction } => {
  const language = effectiveLanguage(usePreferences((s) => s.language));
  return { language, direction: directionOf(language) };
};
