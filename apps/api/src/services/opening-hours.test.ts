import { describe, expect, it } from 'vitest';
import { localTime, openStatus } from './opening-hours';

// Kyiv is UTC+3 in late September (summer time) and UTC+2 from late October.
describe('localTime', () => {
  it('reads the wall clock in the store’s timezone', () => {
    expect(localTime(new Date('2026-09-29T05:30:00Z'), 'Europe/Kyiv')).toBe('08:30');
    expect(localTime(new Date('2026-12-01T05:30:00Z'), 'Europe/Kyiv')).toBe('07:30');
    expect(localTime(new Date('2026-09-29T21:30:00Z'), 'Europe/Kyiv')).toBe('00:30');
    expect(localTime(new Date('2026-09-29T05:30:00Z'), 'America/New_York')).toBe('01:30');
  });
});

describe('openStatus', () => {
  const hours = { opensAt: '08:00', closesAt: '20:00', timezone: 'Europe/Kyiv' };

  it.each([
    ['07:59 Kyiv', '2026-09-29T04:59:00Z', 'beforeOpening'],
    ['08:00 Kyiv, opening minute', '2026-09-29T05:00:00Z', 'open'],
    ['19:59 Kyiv', '2026-09-29T16:59:00Z', 'open'],
    ['20:00 Kyiv, closing minute', '2026-09-29T17:00:00Z', 'afterClosing'],
    ['23:30 Kyiv', '2026-09-29T20:30:00Z', 'afterClosing'],
    // 00:30 in Kyiv is already the next local day: the shop opens later that day.
    ['00:30 Kyiv (still 21:30 UTC the day before)', '2026-09-29T21:30:00Z', 'beforeOpening'],
  ])('%s → %s', (_name, at, expected) => {
    expect(openStatus(hours, new Date(at))).toBe(expected);
  });

  it('uses the store’s own timezone, not UTC', () => {
    // 06:00 UTC: 09:00 in Kyiv (open) but 02:00 in New York (not yet).
    const at = new Date('2026-09-29T06:00:00Z');
    expect(openStatus(hours, at)).toBe('open');
    expect(openStatus({ ...hours, timezone: 'America/New_York' }, at)).toBe('beforeOpening');
  });
});
