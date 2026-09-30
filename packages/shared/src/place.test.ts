import { describe, expect, it } from 'vitest';
import { AutocompleteQuery, AutocompleteResponse, Place } from './index';

describe('AutocompleteQuery', () => {
  it('trims the query and coerces the bias point from query-string text', () => {
    expect(AutocompleteQuery.parse({ q: '  Dorosh ', lat: '49.84', lng: '24.03' })).toEqual({
      q: 'Dorosh',
      lat: 49.84,
      lng: 24.03,
    });
  });

  it('works without a bias point', () => {
    expect(AutocompleteQuery.parse({ q: 'Rynok' })).toEqual({ q: 'Rynok' });
  });

  it.each([
    ['too short', { q: 'D' }],
    ['too long', { q: 'x'.repeat(121) }],
    ['latitude out of range', { q: 'Rynok', lat: '91', lng: '24' }],
    ['not a number', { q: 'Rynok', lat: 'north', lng: '24' }],
  ])('rejects %s', (_name, input) => {
    expect(AutocompleteQuery.safeParse(input).success).toBe(false);
  });

  it('needs both lat and lng, or neither', () => {
    const result = AutocompleteQuery.safeParse({ q: 'Rynok', lat: '49.84' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['lng']);
  });
});

describe('Place and AutocompleteResponse', () => {
  it('accepts a place with an optional secondary line', () => {
    expect(Place.parse({ label: 'Rynok Square 1', lat: 49.8419, lng: 24.0315 })).toEqual({
      label: 'Rynok Square 1',
      lat: 49.8419,
      lng: 24.0315,
    });
  });

  it('requires an id on each suggestion', () => {
    const suggestion = { label: 'vul. Doroshenka 14', secondary: 'Lviv, Ukraine', lat: 1, lng: 2 };
    expect(AutocompleteResponse.safeParse({ results: [suggestion] }).success).toBe(false);
    expect(
      AutocompleteResponse.safeParse({ results: [{ ...suggestion, id: 'W123' }] }).success,
    ).toBe(true);
  });
});
