import { normalizeTime } from './time';

describe('normalizeTime', () => {
  it('pads and accepts : or . separators', () => {
    expect(normalizeTime('8:00')).toBe('08:00');
    expect(normalizeTime('8.30')).toBe('08:30');
    expect(normalizeTime(' 20:00 ')).toBe('20:00');
  });

  it('accepts bare hours', () => {
    expect(normalizeTime('9')).toBe('09:00');
    expect(normalizeTime('21')).toBe('21:00');
  });

  it('leaves anything invalid untouched for validation to report', () => {
    expect(normalizeTime('25:00')).toBe('25:00');
    expect(normalizeTime('8:7')).toBe('8:7');
    expect(normalizeTime('soon')).toBe('soon');
    expect(normalizeTime('')).toBe('');
  });
});
