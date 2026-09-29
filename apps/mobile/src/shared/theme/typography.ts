import type { TextStyle } from 'react-native';

// CSS font stacks from the design, kept verbatim for parity. Native code uses `fontFamily`.
export const fontStack = {
  display: "'Fraunces',Georgia,serif",
  body: "'Figtree',system-ui,-apple-system,sans-serif",
  mono: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
} as const;

// Loaded font names per CSS weight (see `fonts.ts`). On native each weight is its own family.
export const fontFamily = {
  display: { '600': 'Fraunces_600SemiBold', '600italic': 'Fraunces_600SemiBold_Italic' },
  body: {
    '400': 'Figtree_400Regular',
    '500': 'Figtree_500Medium',
    '600': 'Figtree_600SemiBold',
    '700': 'Figtree_700Bold',
  },
} as const;

export type FontFamily = {
  display: Record<keyof typeof fontFamily.display, string>;
  body: Record<keyof typeof fontFamily.body, string>;
};

// Arabic (brief 21): Fraunces and Figtree have no Arabic glyphs. IBM Plex Sans Arabic carries
// display and body (it has Latin too, for shop names). Noto Kufi Arabic was tried for display:
// on iOS it lost the dots above letters and its tall metrics overlapped the line above.
// There's no italic, so the italic display face is the upright one.
export const arabicFontFamily: FontFamily = {
  display: {
    '600': 'IBMPlexSansArabic_600SemiBold',
    '600italic': 'IBMPlexSansArabic_600SemiBold',
  },
  body: {
    '400': 'IBMPlexSansArabic_400Regular',
    '500': 'IBMPlexSansArabic_500Medium',
    '600': 'IBMPlexSansArabic_600SemiBold',
    '700': 'IBMPlexSansArabic_700Bold',
  },
};

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
export type Typography = Record<Variant, TextStyle & { fontSize: number; lineHeight: number }>;

/** The type scale in a set of faces. */
export const typographyFor = (faces: FontFamily): Typography => ({
  display: {
    fontFamily: faces.display['600'],
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.48,
  },
  title: {
    fontFamily: faces.display['600'],
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
  },
  heading: { fontFamily: faces.body['700'], fontSize: 18, lineHeight: 24 },
  body: { fontFamily: faces.body['400'], fontSize: 16, lineHeight: 24 },
  label: { fontFamily: faces.body['600'], fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: faces.body['500'], fontSize: 12, lineHeight: 16 },
});

// `--text-display: 600 32px/38px var(--font-display)` → typography.display. letterSpacing from `.t-*` classes.
export const typography = typographyFor(fontFamily);
