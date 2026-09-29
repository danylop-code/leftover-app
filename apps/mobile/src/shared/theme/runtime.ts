import { type ImageStyle, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { type Direction, directionOf } from '../i18n/languages';
import { useLanguage } from '../i18n/use-language';
import { color, logoPalette, map, media } from './colors';
import { elevation, shadows } from './elevation';
import {
  arabicFontFamily,
  type FontFamily,
  fontFamily,
  type Typography,
  typographyFor,
} from './typography';

export type Scheme = 'light' | 'dark';
export type Script = 'latin' | 'arabic';

type AnyStyle = ViewStyle | TextStyle | ImageStyle;
type NamedStyles<T> = { [P in keyof T]: AnyStyle };

/** Everything that changes with the color scheme or the language. Static tokens stay imports. */
export type Theme = {
  scheme: Scheme;
  direction: Direction;
  script: Script;
  color: Record<keyof typeof color, string>;
  media: Record<keyof typeof media, string>;
  map: Record<keyof typeof map, string>;
  logoPalette: readonly string[];
  shadows: Record<keyof typeof shadows, string>;
  elevation: typeof elevation;
  fontFamily: FontFamily;
  typography: Typography;
  /** `StyleSheet.create` adjusted for the script and direction (see `adjust`). */
  sheet: <T extends NamedStyles<T>>(styles: T & NamedStyles<T>) => T;
};

const swapped: Partial<Record<NonNullable<TextStyle['textAlign']>, TextStyle['textAlign']>> = {
  left: 'right',
  right: 'left',
};

/**
 * What `I18nManager` would do for a right-to-left app, done per style so it also works in Expo Go
 * and on web: text styles get `writingDirection` (so natural alignment follows it) and a mirrored
 * explicit `textAlign`. Arabic is cursive, so letter spacing (which breaks joins and marks) goes.
 * Layout itself mirrors through the root view's `direction` and logical `start`/`end` props.
 */
const adjust = (style: AnyStyle, direction: Direction, script: Script): AnyStyle => {
  const text = style as TextStyle;
  const isText = text.fontFamily !== undefined || text.fontSize !== undefined;
  const next: TextStyle = { ...text };
  // Removed rather than zeroed: on iOS any kern attribute, even 0, can drop Arabic dots (marks).
  if (script === 'arabic') delete next.letterSpacing;
  if (direction === 'rtl') {
    if (isText) next.writingDirection = 'rtl';
    const align = next.textAlign && swapped[next.textAlign];
    if (align) next.textAlign = align;
  }
  return next as AnyStyle;
};

const sheetFor =
  (direction: Direction, script: Script) =>
  <T extends NamedStyles<T>>(styles: T & NamedStyles<T>): T => {
    if (direction === 'ltr' && script === 'latin') return StyleSheet.create(styles) as T;
    const out: Record<string, AnyStyle> = {};
    for (const [name, style] of Object.entries(styles as Record<string, AnyStyle>)) {
      out[name] = adjust(style, direction, script);
    }
    return StyleSheet.create<Record<string, AnyStyle>>(out) as unknown as T;
  };

const build = (scheme: Scheme, direction: Direction, script: Script): Theme => {
  const faces = script === 'arabic' ? arabicFontFamily : fontFamily;
  return {
    scheme,
    direction,
    script,
    color,
    media,
    map,
    logoPalette,
    shadows,
    elevation,
    fontFamily: faces,
    typography: typographyFor(faces),
    sheet: sheetFor(direction, script),
  };
};

const themes = new Map<string, Theme>();

/** One theme object per scheme × language, so styles memoize by identity. */
export const themeFor = (scheme: Scheme, language: 'en' | 'ar'): Theme => {
  const key = `${scheme}:${language}`;
  let theme = themes.get(key);
  if (!theme) {
    theme = build(scheme, directionOf(language), language === 'ar' ? 'arabic' : 'latin');
    themes.set(key, theme);
  }
  return theme;
};

/** The current theme: follows the language now, and the color scheme from brief 19. */
export const useTheme = (): Theme => {
  const { language } = useLanguage();
  return themeFor('light', language);
};

/**
 * A style module as a hook: the factory runs once per theme and its result is cached, so
 * components get stable style objects and re-render with new ones when the theme changes.
 */
export const makeStyles = <T>(factory: (theme: Theme) => T) => {
  const cache = new WeakMap<Theme, T>();
  return (): T => {
    const theme = useTheme();
    let built = cache.get(theme);
    if (!built) {
      built = factory(theme);
      cache.set(theme, built);
    }
    return built;
  };
};
