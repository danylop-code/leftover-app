import i18n from '../i18n';

const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;

/** Time left until something, rounded up to the minute: "1 h 24 min", "45 min", "2 h". */
export const formatDuration = (ms: number): string => {
  const totalMinutes = Math.max(1, Math.ceil(ms / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return i18n.t('format.minutes', { minutes });
  if (minutes === 0) return i18n.t('format.hours', { hours });
  return i18n.t('format.hoursMinutes', { hours, minutes });
};
