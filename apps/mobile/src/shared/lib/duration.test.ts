import { formatDuration } from './duration';

const MIN = 60_000;

describe('formatDuration', () => {
  it.each([
    [84 * MIN, '1 h 24 min'],
    [45 * MIN, '45 min'],
    [120 * MIN, '2 h'],
    [30_000, '1 min'],
    [0, '1 min'],
    [83 * MIN + 1, '1 h 24 min'],
  ])('%p ms → %p', (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});
