import type { ViewStyle } from 'react-native';

// CSS box-shadows from the design, verbatim (`--elevation-1` → `shadows[1]`).
export const shadows = {
  0: 'none',
  1: '0 1px 2px rgba(29,42,34,.06),0 2px 8px rgba(29,42,34,.06)',
  2: '0 4px 10px rgba(29,42,34,.08),0 10px 24px rgba(29,42,34,.08)',
  3: '0 12px 28px rgba(29,42,34,.14),0 24px 56px rgba(29,42,34,.12)',
} as const;

type Level = keyof typeof shadows;
type NativeShadow = Required<
  Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>
> & { shadowRadius: number; elevation: number };

// Android can't draw layered shadows; `elevation` approximates each level.
const androidElevation: Record<Level, number> = { 0: 0, 1: 2, 2: 6, 3: 12 };

const LAYER = /(-?\d+)(?:px)? (-?\d+)(?:px)? (\d+)(?:px)? rgba\((\d+),(\d+),(\d+),([\d.]+)\)/g;

/** Converts the largest (last) CSS shadow layer into iOS shadow props plus Android elevation. */
export const toNativeShadow = (css: string, androidLevel: number): NativeShadow => {
  const layers = [...css.matchAll(LAYER)];
  const last = layers[layers.length - 1];
  if (!last) {
    return {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    };
  }
  const [, x, y, blur, r, g, b, a] = last;
  return {
    shadowColor: `rgb(${r},${g},${b})`,
    shadowOffset: { width: Number(x), height: Number(y) },
    shadowOpacity: Number(a),
    shadowRadius: Number(blur) / 2,
    elevation: androidLevel,
  };
};

export const elevation = {
  0: toNativeShadow(shadows[0], androidElevation[0]),
  1: toNativeShadow(shadows[1], androidElevation[1]),
  2: toNativeShadow(shadows[2], androidElevation[2]),
  3: toNativeShadow(shadows[3], androidElevation[3]),
} as const;
