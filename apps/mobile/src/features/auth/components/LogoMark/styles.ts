import { color } from '../../../../shared/theme';

// The Leftover bag mark from the Welcome artboard (48 grid).
export const mark = {
  viewBox: '0 0 48 48',
  handle: { d: 'M16 16v-3a8 8 0 0 1 16 0v3', strokeWidth: 3.5, color: color.primary },
  body: { x: 6, y: 15, width: 36, height: 28, rx: 10, color: color.primary },
  smile: { d: 'M17 28c2.2 3.4 11.8 3.4 14 0', strokeWidth: 3, color: color.background },
  leaf: { d: 'M32 12c.6-5.4 4.6-8.4 11-8.6-.4 6-4.4 9.4-11 8.6z', color: color.accent },
} as const;
