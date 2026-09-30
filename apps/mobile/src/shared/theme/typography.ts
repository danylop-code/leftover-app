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

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

// `--text-display: 600 32px/38px var(--font-display)` → typography.display. letterSpacing from `.t-*` classes.
export const typography: Record<Variant, TextStyle & { fontSize: number; lineHeight: number }> = {
  display: {
    fontFamily: fontFamily.display['600'],
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.48,
  },
  title: {
    fontFamily: fontFamily.display['600'],
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
  },
  heading: { fontFamily: fontFamily.body['700'], fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fontFamily.body['400'], fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fontFamily.body['600'], fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.body['500'], fontSize: 12, lineHeight: 16 },
};
