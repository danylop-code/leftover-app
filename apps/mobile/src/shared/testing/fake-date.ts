// Fakes only `Date` (timers stay real, so React Query and the router behave normally).
const REAL_TIMERS = [
  'hrtime',
  'nextTick',
  'performance',
  'queueMicrotask',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'requestIdleCallback',
  'cancelIdleCallback',
  'setImmediate',
  'clearImmediate',
  'setInterval',
  'clearInterval',
  'setTimeout',
  'clearTimeout',
] as const;

export const fakeNow = (iso: string) =>
  jest.useFakeTimers({ doNotFake: [...REAL_TIMERS], now: new Date(iso) });
