import { formatRelative } from './relative-time';

const now = new Date('2026-09-29T12:00:00Z');
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe('formatRelative', () => {
  it.each([
    [0, 'Today'],
    [1, 'Yesterday'],
    [2, '2 days ago'],
    [7, '1 week ago'],
    [15, '2 weeks ago'],
    [45, '1 month ago'],
    [90, '3 months ago'],
  ])('%p days → %p', (days, text) => {
    expect(formatRelative(daysAgo(days), now)).toBe(text);
  });
});
