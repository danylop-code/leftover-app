import type { Category } from '@leftover/shared';
import type { media } from '../../theme';

type MediaKey = keyof typeof media;

// Category enum → design tint names (`meals` → `--media-meal`, `groceries` → `--media-grocery`).
export const mediaTint: Record<Category, { bg: MediaKey; ink: MediaKey }> = {
  bakery: { bg: 'bakery', ink: 'bakeryInk' },
  meals: { bg: 'meal', ink: 'mealInk' },
  groceries: { bg: 'grocery', ink: 'groceryInk' },
  cafe: { bg: 'cafe', ink: 'cafeInk' },
  produce: { bg: 'produce', ink: 'produceInk' },
  other: { bg: 'other', ink: 'otherInk' },
};
