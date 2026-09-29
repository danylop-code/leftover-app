import { afterEach, describe, expect, it } from 'vitest';
import { freezeClock, now, nowIso, resetClock } from './clock';

describe('clock', () => {
  afterEach(resetClock);

  it('returns the real time by default', () => {
    const before = Date.now();
    expect(now().getTime()).toBeGreaterThanOrEqual(before);
  });

  it('can be frozen for tests and returns fresh Date copies', () => {
    freezeClock('2026-09-25T15:00:00.000Z');
    expect(nowIso()).toBe('2026-09-25T15:00:00.000Z');
    now().setFullYear(2000);
    expect(nowIso()).toBe('2026-09-25T15:00:00.000Z');
  });

  it('resets', () => {
    freezeClock('2020-01-01T00:00:00.000Z');
    resetClock();
    expect(now().getFullYear()).toBeGreaterThan(2020);
  });
});
