import { describe, expect, it } from 'vitest';
import { Category } from './category';

describe('Category', () => {
  it('accepts every category the app and api share', () => {
    for (const c of ['bakery', 'meals', 'groceries', 'cafe', 'produce', 'other']) {
      expect(Category.parse(c)).toBe(c);
    }
  });

  it('rejects anything else', () => {
    expect(Category.safeParse('meal').success).toBe(false);
    expect(Category.safeParse('').success).toBe(false);
  });
});
