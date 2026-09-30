import type { Direction } from './languages';

// Unicode bidi controls (UAX #9). Invisible; they only steer how a right-to-left line orders
// mixed runs. Isolates keep a run's direction from leaking into the text around it. Time ranges
// are wrapped left-to-right (LRI U+2066 … PDI) in `ar.json` itself.
const FSI = '\u2068'; // first-strong isolate: the run takes the direction of its first letter
const PDI = '\u2069'; // pop directional isolate
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * A value (shop name, address, price, time) set into a right-to-left sentence on its own terms:
 * "Sultan Qaboos Highway · 5 كم" no longer splits around the Latin run, and "counter." keeps
 * its full stop at the end. Harmless in left-to-right text.
 */
export const isolate = (text: string): string => `${FSI}${text}${PDI}`;

/** `isolate` for user text rendered on its own (a bag description) — only in right-to-left. */
export const isolateIn = (direction: Direction, text: string): string =>
  direction === 'rtl' ? isolate(text) : text;

/** Whether `text` contains Arabic letters (picks the face for a shop's initial). */
export const isArabicScript = (text: string): boolean => ARABIC.test(text);
