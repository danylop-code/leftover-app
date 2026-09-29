import { isoAtLocalTime, localTimeOf } from './zoned-time';

describe('zoned time', () => {
  it('turns a Kyiv wall-clock time today into UTC (summer: UTC+3)', () => {
    expect(isoAtLocalTime('18:00', new Date('2026-09-29T14:00:00Z'), 'Europe/Kyiv')).toBe(
      '2026-09-29T15:00:00.000Z',
    );
  });

  it('uses winter time after the clocks change (UTC+2)', () => {
    expect(isoAtLocalTime('18:00', new Date('2026-12-01T10:00:00Z'), 'Europe/Kyiv')).toBe(
      '2026-12-01T16:00:00.000Z',
    );
  });

  it('takes the local day, not the UTC one', () => {
    // 01:30 in Kyiv on 30 Sep is still 29 Sep in UTC.
    expect(isoAtLocalTime('09:00', new Date('2026-09-29T22:30:00Z'), 'Europe/Kyiv')).toBe(
      '2026-09-30T06:00:00.000Z',
    );
  });

  it('reads HH:mm back in the zone', () => {
    expect(localTimeOf('2026-09-29T15:00:00.000Z', 'Europe/Kyiv')).toBe('18:00');
    expect(localTimeOf('2026-09-29T15:00:00.000Z', 'America/New_York')).toBe('11:00');
  });
});
