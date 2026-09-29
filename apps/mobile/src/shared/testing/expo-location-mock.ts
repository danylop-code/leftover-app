// Jest stand-in for expo-location (registered in jest.setup.ts). Defaults: permission granted,
// the device at Rynok Square, no forward-geocoding matches. Tests override per case.
export const DEVICE_POSITION = { latitude: 49.8419, longitude: 24.0315 };

const defaults = {
  requestForegroundPermissionsAsync: async () => ({ status: 'granted', granted: true }),
  getCurrentPositionAsync: async () => ({ coords: DEVICE_POSITION, timestamp: 0 }),
  reverseGeocodeAsync: async () => [
    {
      street: 'Rynok Square',
      streetNumber: '1',
      name: '1 Rynok Square',
      city: 'Lviv',
      country: 'Ukraine',
    },
  ],
  geocodeAsync: async () => [],
};

export const expoLocationMock = {
  requestForegroundPermissionsAsync: jest.fn(defaults.requestForegroundPermissionsAsync),
  getCurrentPositionAsync: jest.fn(defaults.getCurrentPositionAsync),
  reverseGeocodeAsync: jest.fn(defaults.reverseGeocodeAsync),
  geocodeAsync: jest.fn(defaults.geocodeAsync),
  Accuracy: { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5, BestForNavigation: 6 },
  /** Test helper: back to the defaults between tests. */
  __reset: () => {
    for (const [name, impl] of Object.entries(defaults)) {
      (expoLocationMock[name as keyof typeof defaults] as jest.Mock)
        .mockReset()
        .mockImplementation(impl);
    }
  },
};
