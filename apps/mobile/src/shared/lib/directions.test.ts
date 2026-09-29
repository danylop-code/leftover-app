import { directionsUrl } from './directions';

const crumb = { lat: 49.8393, lng: 24.0325 };

describe('directionsUrl', () => {
  it('opens Apple Maps with directions to the coordinates on iOS', () => {
    expect(directionsUrl(crumb, 'Crumb & Co. Bakery', 'ios')).toBe(
      'https://maps.apple.com/?daddr=49.8393,24.0325&q=Crumb%20%26%20Co.%20Bakery',
    );
  });

  it('uses a geo: link with a labelled pin on Android', () => {
    expect(directionsUrl(crumb, 'Crumb & Co. Bakery', 'android')).toBe(
      'geo:49.8393,24.0325?q=49.8393,24.0325(Crumb%20%26%20Co.%20Bakery)',
    );
  });

  it('falls back to Google Maps directions elsewhere (web)', () => {
    expect(directionsUrl(crumb, 'Crumb', 'web')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=49.8393,24.0325',
    );
  });
});
