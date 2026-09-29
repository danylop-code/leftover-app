import type { OpenStatus, Store } from '@leftover/shared';

/** Wall-clock `HH:mm` at `at` in `timeZone`. */
export const localTime = (at: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(at);

/** Calendar date `YYYY-MM-DD` at `at` in `timeZone` (en-CA formats dates that way). */
export const localDate = (at: Date | string, timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(at));

/**
 * Whether the store is open at `at`, in its own timezone. Hours are same-day (closes after
 * opens), so "HH:mm" strings compare correctly as text; closing time itself counts as closed.
 */
export const openStatus = (
  store: Pick<Store, 'opensAt' | 'closesAt' | 'timezone'>,
  at: Date,
): OpenStatus => {
  const time = localTime(at, store.timezone);
  if (time < store.opensAt) return 'beforeOpening';
  if (time >= store.closesAt) return 'afterClosing';
  return 'open';
};
