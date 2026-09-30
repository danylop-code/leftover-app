import type { Category } from '@leftover/shared';

// Stroke icons from the design (24 grid, 2px stroke, round caps & joins, currentColor).
// Each icon is a list of shapes, drawn by <Icon>.
export type Shape =
  | { d: string }
  | { circle: readonly [cx: number, cy: number, r: number] }
  | { rect: readonly [x: number, y: number, w: number, h: number, rx: number] };

export const icons = {
  back: [{ d: 'm15 18-6-6 6-6' }],
  chevronRight: [{ d: 'm9 18 6-6-6-6' }],
  chevronDown: [{ d: 'm6 9 6 6 6-6' }],
  close: [{ d: 'M6 6l12 12M18 6 6 18' }],
  minus: [{ d: 'M5 12h14' }],
  plus: [{ d: 'M12 5v14M5 12h14' }],
  check: [{ d: 'm5 12.5 4.5 4.5L19 7.5' }],
  clock: [{ circle: [12, 12, 9] }, { d: 'M12 7v5l3 2' }],
  alert: [{ circle: [12, 12, 9] }, { d: 'M12 7.5v5.5M12 16.5v.01' }],
  directions: [{ d: 'M3 11 21 3l-8 18-2-8z' }],
  mail: [{ rect: [3, 5, 18, 14, 3] }, { d: 'm4 7 8 6 8-6' }],
  lock: [{ rect: [5, 11, 14, 10, 2.5] }, { d: 'M8 11V7.5a4 4 0 0 1 8 0V11' }],
  eye: [{ d: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z' }, { circle: [12, 12, 3] }],
  eyeOff: [
    { d: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z' },
    { circle: [12, 12, 3] },
    { d: 'M3 3l18 18' },
  ],
  search: [{ circle: [11, 11, 7] }, { d: 'm20 20-3.5-3.5' }],
  heart: [
    {
      d: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
    },
  ],
  pin: [
    { d: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z' },
    { circle: [12, 9.5, 2.5] },
  ],
  map: [{ d: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z' }, { d: 'M9 3v15M15 6v15' }],
  locate: [
    { circle: [12, 12, 7] },
    { circle: [12, 12, 2.5] },
    { d: 'M12 2v3M12 19v3M2 12h3M19 12h3' },
  ],
  wifiOff: [
    {
      d: 'M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.5 5.1M5 12.4a10 10 0 0 1 3.3-2M19 12.4a10 10 0 0 0-2.5-1.7M8.5 16a5 5 0 0 1 5.3-.9M12 20h.01M3 3l18 18',
    },
  ],
  refresh: [{ d: 'M20 11a8 8 0 1 0-2.3 5.7' }, { d: 'M20 4v7h-7' }],
  discover: [{ circle: [12, 12, 9] }, { d: 'm15.5 8.5-2 5-5 2 2-5z' }],
  orders: [{ d: 'M6 3h12v18l-3-2-3 2-3-2-3 2z' }, { d: 'M9 8h6M9 12h6M9 16h3' }],
  profile: [{ circle: [12, 8, 4] }, { d: 'M4 21a8 8 0 0 1 16 0' }],
  bag: [
    { d: 'M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z' },
    { d: 'M9 8V6.5a3 3 0 0 1 6 0V8' },
  ],
  store: [
    { d: 'M4 10v10h16V10' },
    { d: 'M3 10l2-6h14l2 6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z' },
    { d: 'M10 20v-5h4v5' },
  ],
  card: [{ rect: [3, 6, 18, 13, 3] }, { d: 'M3 10h18M16 15h2' }],
  globe: [
    { circle: [12, 12, 9] },
    {
      d: 'M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z',
    },
  ],
  edit: [{ d: 'M4 20h4L19 9l-4-4L4 16z' }, { d: 'm13.5 6.5 4 4' }],
  flag: [{ d: 'M5 21V4M5 4h11l-2 4.5 2 4.5H5' }],
  logout: [{ d: 'M10 4H5v16h5M14 8l4 4-4 4M18 12H9' }],
  share: [{ d: 'M12 15V3M7 8l5-5 5 5M5 13v7h14v-7' }],
  // Appearance (brief 19).
  moon: [{ d: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z' }],
  // Photos (brief 20): take one, or pick from the library.
  camera: [{ d: 'M4 8h3l2-3h6l2 3h3v11H4z' }, { circle: [12, 13, 3.5] }],
  image: [{ rect: [3, 4, 18, 16, 2] }, { circle: [9, 10, 2] }, { d: 'm21 16-5-5-9 9' }],
} as const satisfies Record<string, readonly Shape[]>;

export type IconName = keyof typeof icons;

// Filled star used by ratings (`.star`), 24 grid.
export const starPath =
  'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z';

// Category placeholder art (`.art`, 48 grid). Grocery and other aren't drawn in the design;
// they follow the same stroke style.
export const categoryArt: Record<Category, readonly Shape[]> = {
  bakery: [
    { d: 'M8 38c-4 0-6-3-6-7 0-9 10-16 22-16s22 7 22 16c0 4-2 7-6 7z' },
    { d: 'M16 22l3 6M24 20l2 7M32 22l1 6' },
  ],
  meals: [{ d: 'M6 24h36a18 18 0 0 1-36 0z' }, { d: 'M18 18c0-4 4-4 4-8M26 18c0-4 4-4 4-8' }],
  groceries: [
    { d: 'M6 20h36l-4 19a4 4 0 0 1-4 3H14a4 4 0 0 1-4-3z' },
    { d: 'M16 20l6-12M32 20l-6-12' },
    { d: 'M18 28v7M24 28v7M30 28v7' },
  ],
  cafe: [
    { d: 'M8 18h26v10a13 13 0 0 1-26 0z' },
    { d: 'M34 21h3a5 5 0 0 1 0 10h-4' },
    { d: 'M16 6c0 3 3 3 3 6M24 6c0 3 3 3 3 6' },
  ],
  produce: [
    {
      d: 'M24 14c-8-5-18 0-16 12 1 9 7 16 12 16 2 0 3-1 4-1s2 1 4 1c5 0 11-7 12-16 2-12-8-17-16-12z',
    },
    { d: 'M24 14c0-4 2-7 5-9' },
  ],
  other: [{ d: 'M10 16h28l-2 26H12z' }, { d: 'M18 16v-4a6 6 0 0 1 12 0v4' }],
};

export const ICON_VIEWBOX = '0 0 24 24';
export const ART_VIEWBOX = '0 0 48 48';
export const ICON_STROKE_WIDTH = 2;
