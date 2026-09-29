import { describe, expect, it } from 'vitest';
import { toSuggestion } from './photon';

const at = (properties: Record<string, string>) => ({
  geometry: { coordinates: [24.03, 49.84] as [number, number] },
  properties: { osm_type: 'N', osm_id: 7, ...properties },
});

describe('toSuggestion', () => {
  it('leads a plain address with street and number', () => {
    expect(
      toSuggestion(
        at({ street: 'Rynok Square', housenumber: '1', city: 'Lviv', country: 'Ukraine' }),
      ),
    ).toEqual({
      id: 'N7',
      label: 'Rynok Square 1',
      secondary: 'Lviv, Ukraine',
      lat: 49.84,
      lng: 24.03,
    });
  });

  it('leads a named place with its name and puts the street underneath', () => {
    expect(
      toSuggestion(
        at({ name: 'Kredens Café', street: 'Rynok Square', housenumber: '5', city: 'Lviv' }),
      ),
    ).toMatchObject({ label: 'Kredens Café', secondary: 'Rynok Square 5, Lviv' });
  });

  it('falls back from city to district, county or state and skips repeats of the label', () => {
    expect(
      toSuggestion(at({ name: 'Lviv', state: 'Lviv Oblast', country: 'Ukraine' })),
    ).toMatchObject({ label: 'Lviv', secondary: 'Lviv Oblast, Ukraine' });
    expect(toSuggestion(at({ name: 'Lviv', city: 'Lviv' }))).not.toHaveProperty('secondary');
  });

  it('drops features with nothing to call them', () => {
    expect(toSuggestion(at({ city: 'Lviv' }))).toBeNull();
  });
});
