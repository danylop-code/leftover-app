import { describe, expect, it } from 'vitest';
import { MARKETS, marketFor, minorPerMajor } from './market';

describe('markets', () => {
  it('uses baisa (3 decimals) for Oman and kopiyky (2) for Ukraine', () => {
    expect(minorPerMajor(MARKETS.OM.currency)).toBe(1000);
    expect(minorPerMajor(MARKETS.UA.currency)).toBe(100);
  });

  it('gives Oman the Muscat time zone', () => {
    expect(MARKETS.OM.timezone).toBe('Asia/Muscat');
  });

  it('falls back to Oman for a missing or unknown code', () => {
    expect(marketFor(undefined).code).toBe('OM');
    expect(marketFor('XX').code).toBe('OM');
    expect(marketFor('UA').code).toBe('UA');
  });
});
