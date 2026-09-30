// Wall-clock times in a store's timezone ↔ UTC instants, with Intl only (no tz database here).

const MS_PER_MINUTE = 60_000;

const parts = (at: Date, timeZone: string) => {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return {
    y: Number(values.year),
    m: Number(values.month),
    d: Number(values.day),
    h: Number(values.hour),
    min: Number(values.minute),
  };
};

/** Minutes the zone is ahead of UTC at `at` (Kyiv in summer: 180). */
const offsetMinutes = (at: Date, timeZone: string) => {
  const p = parts(at, timeZone);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
  return Math.round(
    (asUtc - Math.floor(at.getTime() / MS_PER_MINUTE) * MS_PER_MINUTE) / MS_PER_MINUTE,
  );
};

/** `HH:mm` of `iso` in `timeZone`. */
export const localTimeOf = (iso: string, timeZone: string): string => {
  const p = parts(new Date(iso), timeZone);
  return `${String(p.h).padStart(2, '0')}:${String(p.min).padStart(2, '0')}`;
};

/**
 * The UTC instant (ISO) of `hhmm` on the same local day as `day` in `timeZone`,
 * e.g. ("18:00", now, "Europe/Kyiv") → today's 18:00 in Kyiv as `…T15:00:00.000Z` in summer.
 */
export const isoAtLocalTime = (hhmm: string, day: Date, timeZone: string): string => {
  const [h, min] = hhmm.split(':').map(Number) as [number, number];
  const p = parts(day, timeZone);
  const guess = Date.UTC(p.y, p.m - 1, p.d, h, min);
  // Correct by the zone's offset at that moment (twice, in case it crosses a DST change).
  let at = guess - offsetMinutes(new Date(guess), timeZone) * MS_PER_MINUTE;
  at = guess - offsetMinutes(new Date(at), timeZone) * MS_PER_MINUTE;
  return new Date(at).toISOString();
};
