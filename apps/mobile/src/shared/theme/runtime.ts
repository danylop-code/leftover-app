import {
  type ImageStyle,
  StyleSheet,
  type TextStyle,
  useColorScheme,
  type ViewStyle,
} from 'react-native';
import { type Direction, directionOf } from '../i18n/languages';
import { useLanguage } from '../i18n/use-language';
import { usePreferences } from '../store/preferences';
import { color, darkColor, darkMap, darkMedia, logoPalette, map, media } from './colors';
import { darkElevation, darkShadows, elevation, shadows } from './elevation';
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
  /** Both scripts' faces, for text whose script isn't the app's (a Latin shop initial in Arabic). */
  scriptFonts: Record<Script, FontFamily>;
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

const palettes = {
  light: { color, media, map, shadows, elevation },
  dark: {
    color: darkColor,
    media: darkMedia,
    map: darkMap,
    shadows: darkShadows,
    elevation: darkElevation,
  },
} satisfies Record<Scheme, Pick<Theme, 'color' | 'media' | 'map' | 'shadows' | 'elevation'>>;

const build = (scheme: Scheme, direction: Direction, script: Script): Theme => {
  const faces = script === 'arabic' ? arabicFontFamily : fontFamily;
  return {
    scheme,
    direction,
    script,
    ...palettes[scheme],
    logoPalette,
    fontFamily: faces,
    scriptFonts: { latin: fontFamily, arabic: arabicFontFamily },
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

/** Light or dark: the choice in Profile, or the phone's setting (followed live) on System. */
export const useScheme = (): Scheme => {
  const appearance = usePreferences((s) => s.appearance);
  const system = useColorScheme();
  if (appearance !== 'system') return appearance;
  return system === 'dark' ? 'dark' : 'light';
};

/** The current theme: the color scheme (19) and the language's script and direction (21). */
export const useTheme = (): Theme => {
  const { language } = useLanguage();
  return themeFor(useScheme(), language);
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
