import { describe, expect, it } from 'vitest';
import { pickCode } from './pickup-code';

// A fake random source replaying fixed values in [0, 1).
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] as number;
};

describe('pickCode', () => {
  it('formats four digits, keeping leading zeros', () => {
    expect(pickCode(new Set(), sequence(0.0042))).toBe('0042');
    expect(pickCode(new Set(), sequence(0.9999))).toBe('9999');
  });

  it('retries until it finds a code nobody holds', () => {
    expect(pickCode(new Set(['1234', '5678']), sequence(0.1234, 0.5678, 0.4321))).toBe('4321');
  });

  it('gives up after too many collisions', () => {
    expect(() => pickCode(new Set(['1111']), sequence(0.1111))).toThrow(/pickup code/);
  });
});
