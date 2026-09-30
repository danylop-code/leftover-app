import { StyleSheet } from 'react-native';
import { themeFor } from './runtime';

describe('theme per language', () => {
  it('uses the Latin faces and leaves styles alone in English', () => {
    const theme = themeFor('light', 'en');
    expect(theme.direction).toBe('ltr');
    expect(theme.typography.body.fontFamily).toBe('Figtree_400Regular');
    const s = theme.sheet({ t: { fontSize: 14, textAlign: 'right', letterSpacing: 0.7 } });
    expect(StyleSheet.flatten(s.t)).toEqual({
      fontSize: 14,
      textAlign: 'right',
      letterSpacing: 0.7,
    });
  });

  it('switches to the Arabic faces, right-to-left text and no letter spacing in Arabic', () => {
    const theme = themeFor('light', 'ar');
    expect(theme.direction).toBe('rtl');
    expect(theme.typography.body.fontFamily).toBe('IBMPlexSansArabic_400Regular');
    expect(theme.typography.display.fontFamily).toBe('IBMPlexSansArabic_600SemiBold');
    const s = theme.sheet({
      t: { fontSize: 14, textAlign: 'right', letterSpacing: 0.7 },
      box: { paddingStart: 4 },
    });
    expect(StyleSheet.flatten(s.t)).toEqual({
      fontSize: 14,
      textAlign: 'left',
      writingDirection: 'rtl',
    });
    expect(StyleSheet.flatten(s.box)).toEqual({ paddingStart: 4 });
  });

  it('returns the same theme object for the same scheme and language', () => {
    expect(themeFor('light', 'ar')).toBe(themeFor('light', 'ar'));
  });
});
