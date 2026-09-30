import { fraction, snap, valueAt } from './slider-math';

describe('slider math', () => {
  it('snaps to 1 km steps inside the bounds', () => {
    expect(snap(5.4, 1, 30, 1)).toBe(5);
    expect(snap(5.6, 1, 30, 1)).toBe(6);
    expect(snap(-3, 1, 30, 1)).toBe(1);
    expect(snap(99, 1, 30, 1)).toBe(30);
  });

  it('maps a touch x to a value', () => {
    expect(valueAt(0, 290, 1, 30, 1)).toBe(1);
    expect(valueAt(290, 290, 1, 30, 1)).toBe(30);
    expect(valueAt(40, 290, 1, 30, 1)).toBe(5);
    expect(valueAt(10, 0, 1, 30, 1)).toBe(1);
  });

  it('computes the filled fraction', () => {
    expect(fraction(1, 1, 30)).toBe(0);
    expect(fraction(30, 1, 30)).toBe(1);
    expect(fraction(3, 3, 3)).toBe(0);
  });
});
