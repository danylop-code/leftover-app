import { describe, expect, it } from 'vitest';
import { StoreProfileBody, StoreProfilePatch, TimeZone } from './index';

const valid = {
  name: 'Crumb & Co. Bakery',
  category: 'bakery',
  address: 'vul. Doroshenka 32',
  lat: 49.8393,
  lng: 24.0325,
  opensAt: '08:00',
  closesAt: '20:00',
};

describe('StoreProfileBody', () => {
  it('accepts a valid profile and defaults the timezone to Europe/Kyiv', () => {
    expect(StoreProfileBody.parse(valid).timezone).toBe('Europe/Kyiv');
  });

  it('trims name and address and enforces their lengths', () => {
    expect(StoreProfileBody.parse({ ...valid, name: '  Crumb  ' }).name).toBe('Crumb');
    expect(StoreProfileBody.safeParse({ ...valid, name: 'C' }).success).toBe(false);
    expect(StoreProfileBody.safeParse({ ...valid, name: 'x'.repeat(61) }).success).toBe(false);
    expect(StoreProfileBody.safeParse({ ...valid, address: 'ab' }).success).toBe(false);
    expect(StoreProfileBody.safeParse({ ...valid, address: 'x'.repeat(121) }).success).toBe(false);
  });

  it('requires HH:mm hours with closing after opening', () => {
    expect(StoreProfileBody.safeParse({ ...valid, opensAt: '8:00' }).success).toBe(false);
    expect(StoreProfileBody.safeParse({ ...valid, closesAt: '24:00' }).success).toBe(false);
    const equal = StoreProfileBody.safeParse({ ...valid, closesAt: '08:00' });
    expect(equal.success).toBe(false);
    expect(equal.error?.issues[0]?.path).toEqual(['closesAt']);
    expect(StoreProfileBody.safeParse({ ...valid, opensAt: '21:00' }).success).toBe(false);
  });

  it('rejects out-of-range coordinates', () => {
    expect(StoreProfileBody.safeParse({ ...valid, lat: 90.1 }).success).toBe(false);
    expect(StoreProfileBody.safeParse({ ...valid, lng: -180.5 }).success).toBe(false);
  });
});

describe('StoreProfilePatch', () => {
  it('accepts partial updates without defaulting the timezone', () => {
    expect(StoreProfilePatch.parse({ name: 'New name' })).toEqual({ name: 'New name' });
  });

  it('checks the hours when both are sent', () => {
    expect(StoreProfilePatch.safeParse({ opensAt: '10:00', closesAt: '09:00' }).success).toBe(
      false,
    );
  });
});

describe('TimeZone', () => {
  it('accepts IANA zones and rejects anything else', () => {
    expect(TimeZone.safeParse('Europe/Kyiv').success).toBe(true);
    expect(TimeZone.safeParse('America/New_York').success).toBe(true);
    expect(TimeZone.safeParse('Mars/Olympus').success).toBe(false);
  });
});
