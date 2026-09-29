import i18n from '../i18n';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;

/** "Today", "Yesterday", "2 days ago", "1 week ago", "3 months ago". */
export const formatRelative = (iso: string, now: Date = new Date()): string => {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return i18n.t('relative.today');
  if (days === 1) return i18n.t('relative.yesterday');
  if (days < DAYS_PER_WEEK) return i18n.t('relative.days', { count: days });
  if (days < DAYS_PER_MONTH)
    return i18n.t('relative.weeks', { count: Math.floor(days / DAYS_PER_WEEK) });
  return i18n.t('relative.months', { count: Math.floor(days / DAYS_PER_MONTH) });
};
