import { darkColor, darkMedia } from '.';

// WCAG 2.x relative luminance and contrast ratio.
const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

type Key = keyof typeof darkColor;
const TEXT = 4.5;
const UI = 3;

// Foreground on background, as the kit and screens pair them.
const pairs: [Key, Key, number][] = [
  ['textPrimary', 'background', TEXT],
  ['textPrimary', 'surface', TEXT],
  ['textPrimary', 'surfaceSunken', TEXT],
  ['textPrimary', 'primaryTint', TEXT],
  ['textSecondary', 'background', TEXT],
  ['textSecondary', 'surface', TEXT],
  ['textSecondary', 'surfaceSunken', TEXT],
  ['primary', 'background', TEXT],
  ['primary', 'surface', TEXT],
  ['primary', 'primarySoft', TEXT],
  ['onPrimary', 'primary', TEXT],
  ['onAccent', 'accent', TEXT],
  ['accentPressed', 'accentSoft', TEXT],
  ['danger', 'surface', TEXT],
  ['danger', 'dangerSoft', TEXT],
  ['success', 'successSoft', TEXT],
  ['warning', 'warningSoft', TEXT],
  ['onInverse', 'inverse', TEXT],
  ['toastAction', 'inverse', TEXT],
  ['toastSuccessIcon', 'inverse', UI],
  ['toastErrorIcon', 'inverse', UI],
  ['borderStrong', 'surface', UI],
  ['borderStrong', 'background', UI],
  ['star', 'surface', UI],
];

describe('dark theme contrast (WCAG AA, brief 19)', () => {
  it.each(pairs)('%s on %s ≥ %p:1', (fg, bg, min) => {
    expect(contrast(darkColor[fg], darkColor[bg])).toBeGreaterThanOrEqual(min);
  });

  it.each([
    ['bakeryInk', 'bakery'],
    ['mealInk', 'meal'],
    ['groceryInk', 'grocery'],
    ['cafeInk', 'cafe'],
    ['produceInk', 'produce'],
  ] as const)('category glyph %s on %s ≥ 3:1', (ink, bg) => {
    expect(contrast(darkMedia[ink], darkMedia[bg])).toBeGreaterThanOrEqual(UI);
  });
});
