// 4-based spacing scale (`--space-4` → `space[4]`).
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// Minimum hit area for every interactive element (`--tap-min`).
export const tapMin = 48;

/** Pads a control drawn smaller than `tapMin` so its touch area still reaches it. */
export const hitSlopFor = (drawnSize: number) => {
  const pad = Math.max(0, (tapMin - drawnSize) / 2);
  return { top: pad, bottom: pad, left: pad, right: pad };
};

// Icon sizes from the design's `.ic`, `.ic-16`, `.ic-24`, `.ic-28`, `.ic-40`.
export const iconSize = { sm: 16, md: 20, lg: 24, xl: 28, xxl: 40 } as const;

// Screen layout constants from the Foundations artboard.
export const layout = {
  screenMargin: space[5],
  cardGap: space[4],
  sectionGap: space[8],
} as const;
