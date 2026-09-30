import { describe, expect, it } from 'vitest';
import { ReviewBody, roundRating } from './index';

describe('ReviewBody', () => {
  it('needs an overall 1–5; aspects are optional; text is trimmed and ≤ 500', () => {
    expect(ReviewBody.parse({ overall: 4, text: '  Nice  ' })).toEqual({
      overall: 4,
      text: 'Nice',
    });
    expect(ReviewBody.safeParse({ text: 'x' }).success).toBe(false);
    expect(ReviewBody.safeParse({ overall: 0 }).success).toBe(false);
    expect(ReviewBody.safeParse({ overall: 5, quality: 6 }).success).toBe(false);
    expect(ReviewBody.safeParse({ overall: 5, text: 'x'.repeat(501) }).success).toBe(false);
    expect(ReviewBody.safeParse({ overall: 5, text: 'x'.repeat(500) }).success).toBe(true);
  });
});

describe('roundRating', () => {
  it('rounds to one decimal', () => {
    expect(roundRating(14 / 3)).toBe(4.7);
    expect(roundRating(4.25)).toBe(4.3);
    expect(roundRating(4)).toBe(4);
  });
});
