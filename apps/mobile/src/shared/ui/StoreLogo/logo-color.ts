import { logoPalette } from '../../theme';

/** Stable palette pick for a store: same id → same color on every screen. */
export const logoColor = (seed: string, palette: readonly string[] = logoPalette) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length] as string;
};
