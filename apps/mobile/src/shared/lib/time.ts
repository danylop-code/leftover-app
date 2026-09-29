const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;

/** Normalises typed times to `HH:mm` ("8:00" → "08:00", "9" → "09:00"); invalid input is returned trimmed-as-typed. */
export const normalizeTime = (input: string): string => {
  const trimmed = input.trim();
  const m = trimmed.match(/^(\d{1,2})(?:[:.](\d{2}))?$/);
  if (!m) return input;
  const hours = Number(m[1]);
  const minutes = Number(m[2] ?? '0');
  if (hours >= HOURS_IN_DAY || minutes >= MINUTES_IN_HOUR) return trimmed;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
