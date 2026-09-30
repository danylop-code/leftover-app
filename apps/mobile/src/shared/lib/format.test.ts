import { formatDiscount, formatDistance, formatMoney, formatWindow } from './format';

describe('formatMoney', () => {
  it('formats whole hryvnias without decimals', () => {
    expect(formatMoney(14900)).toBe('₴149');
    expect(formatMoney(0)).toBe('₴0');
  });

  it('groups thousands', () => {
    expect(formatMoney(348000)).toBe('₴3,480');
    expect(formatMoney(123456700)).toBe('₴1,234,567');
  });

  it('shows kopiyky only when present', () => {
    expect(formatMoney(14950)).toBe('₴149.50');
    expect(formatMoney(5)).toBe('₴0.05');
  });

  it('rejects floats in dev', () => {
    expect(() => formatMoney(149.5)).toThrow(/integer/);
  });
});

describe('formatDiscount', () => {
  it('rounds the saving to a whole percent with a real minus sign', () => {
    expect(formatDiscount(45000, 14900)).toBe('−67%');
    expect(formatDiscount(52000, 17900)).toBe('−66%');
  });

  it('returns null when there is no discount', () => {
    expect(formatDiscount(14900, 14900)).toBeNull();
    expect(formatDiscount(14900, 20000)).toBeNull();
    expect(formatDiscount(0, 0)).toBeNull();
  });
});

describe('formatDistance', () => {
  it('uses one decimal under 10 km', () => {
    expect(formatDistance(0.8)).toBe('0.8 km');
    expect(formatDistance(1.44)).toBe('1.4 km');
  });

  it('never shows 0.0', () => {
    expect(formatDistance(0.01)).toBe('0.1 km');
  });

  it('rounds to whole km from 10 km', () => {
    expect(formatDistance(12.6)).toBe('13 km');
  });
});

describe('formatWindow', () => {
  const kyiv = 'Europe/Kyiv'; // UTC+3 in September (EEST)
  // 2026-09-25 is a Friday; 10:00 in Kyiv.
  const now = new Date('2026-09-25T07:00:00Z');

  it('labels a window later today in the store timezone', () => {
    expect(formatWindow('2026-09-25T15:00:00Z', '2026-09-25T16:30:00Z', kyiv, now)).toBe(
      'Today · 18:00–19:30',
    );
  });

  it('labels tomorrow', () => {
    expect(formatWindow('2026-09-26T15:00:00Z', '2026-09-26T16:30:00Z', kyiv, now)).toBe(
      'Tomorrow · 18:00–19:30',
    );
  });

  it('labels later dates with weekday, day and month', () => {
    expect(formatWindow('2026-09-27T15:00:00Z', '2026-09-27T16:30:00Z', kyiv, now)).toBe(
      'Sun, 27 Sep · 18:00–19:30',
    );
  });

  it('decides "today" by the store timezone, not UTC', () => {
    // 22:30 UTC on the 25th is already 01:30 on the 26th in Kyiv.
    const lateUtc = new Date('2026-09-25T22:30:00Z');
    expect(formatWindow('2026-09-26T05:00:00Z', '2026-09-26T06:00:00Z', kyiv, lateUtc)).toBe(
      'Today · 08:00–09:00',
    );
    // The same instants seen from New York (UTC−4) are still the 25th.
    expect(
      formatWindow('2026-09-26T05:00:00Z', '2026-09-26T06:00:00Z', 'America/New_York', lateUtc),
    ).toBe('Tomorrow · 01:00–02:00');
  });

  it('handles the tomorrow boundary across a DST change', () => {
    // Kyiv leaves DST on 2026-10-25 at 04:00 local; now is 23:30 local on the 24th.
    const beforeShift = new Date('2026-10-24T20:30:00Z');
    expect(formatWindow('2026-10-25T16:00:00Z', '2026-10-25T17:00:00Z', kyiv, beforeShift)).toBe(
      'Tomorrow · 18:00–19:00',
    );
  });
});
