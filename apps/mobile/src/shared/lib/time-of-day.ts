const DEFAULT_TIME = '18:00';

/** `HH:mm` → a Date carrying that wall-clock time (today, device time; only h and m matter). */
export const dateForTime = (hhmm: string): Date => {
  const [h, m] = (hhmm || DEFAULT_TIME).split(':').map(Number) as [number, number];
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

/** A Date's wall-clock time as `HH:mm`. */
export const timeOfDate = (d: Date): string =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
