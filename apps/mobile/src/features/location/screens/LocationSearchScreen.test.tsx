import type { Place, PlaceSuggestion } from '@leftover/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { useLocation } from '../../../shared/store/location';
import { createTestQueryClient } from '../../../shared/testing/render';
import { LocationSearchScreen } from './LocationSearchScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const pin: Place = {
  label: 'Rynok Square 1',
  secondary: 'Lviv, Ukraine',
  lat: 49.8419,
  lng: 24.0315,
};
const suggestions: PlaceSuggestion[] = [
  { id: 'N1', label: 'vul. Doroshenka 14', secondary: 'Lviv, Ukraine', lat: 49.8401, lng: 24.0297 },
  { id: 'N2', label: 'Doroshenka tram stop', secondary: 'Lviv, Ukraine', lat: 49.839, lng: 24.028 },
];
const recent: Place = {
  label: 'prosp. Svobody 28',
  secondary: 'Lviv, Ukraine',
  lat: 49.8436,
  lng: 24.0265,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

// The search screen is pushed on top of Location, so choosing goes back there.
const open = async () => {
  renderRouter(
    {
      location: () => <Text>Location screen</Text>,
      'location-search': LocationSearchScreen,
    },
    { initialUrl: '/location', wrapper: Wrapper },
  );
  const { router } = jest.requireActual('expo-router');
  await act(async () => router.push('/location-search'));
};

const field = () => screen.getByLabelText('Search address');
const type = (text: string) => fireEvent.changeText(field(), text);

beforeEach(() => {
  request.mockReset();
  useLocation.setState({ selected: pin, draft: { place: pin, radiusKm: 5 } });
});

describe('LocationSearchScreen', () => {
  it('shows provider suggestions once typing pauses, with distance from the pin', async () => {
    request.mockResolvedValue({ results: suggestions });
    await open();
    type('Dorosh');
    expect(request).not.toHaveBeenCalled();

    const first = await screen.findByRole('button', { name: /vul\. Doroshenka 14/ });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      '/geo/autocomplete',
      expect.objectContaining({ query: { q: 'Dorosh', lat: pin.lat, lng: pin.lng } }),
    );
    expect(first).toHaveAccessibleName('vul. Doroshenka 14, Lviv, Ukraine, 0.2 km');
    const rows = screen.getAllByRole('button', { name: /Dorosh/ });
    expect(rows.map((r) => r.props.accessibilityLabel)).toEqual([
      'vul. Doroshenka 14, Lviv, Ukraine, 0.2 km',
      'Doroshenka tram stop, Lviv, Ukraine, 0.4 km',
    ]);
  });

  it('choosing a suggestion moves the pin there, labels it and puts it on top of recents', async () => {
    useLocation.setState({ recent: [recent] });
    request.mockResolvedValue({ results: suggestions });
    await open();
    type('Dorosh');
    fireEvent.press(await screen.findByRole('button', { name: /vul\. Doroshenka 14/ }));

    const { id: _id, ...chosen } = suggestions[0] as PlaceSuggestion;
    expect(useLocation.getState().draft.place).toEqual(chosen);
    expect(useLocation.getState().recent).toEqual([chosen, recent]);
    expect(await screen.findByText('Location screen')).toBeOnTheScreen();
  });

  it('falls back to on-device geocoding when the provider fails', async () => {
    request.mockRejectedValue(new ApiError(502, 'geo_unavailable', 'down'));
    (Location.geocodeAsync as jest.Mock).mockResolvedValue([
      { latitude: 49.8401, longitude: 24.0297 },
    ]);
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
      { street: 'vulytsia Doroshenka', streetNumber: '14', city: 'Lviv', country: 'Ukraine' },
    ]);
    await open();
    type('Doroshenka 14');
    const row = await screen.findByRole('button', { name: /vulytsia Doroshenka 14/ });
    expect(Location.geocodeAsync).toHaveBeenCalledWith('Doroshenka 14');
    fireEvent.press(row);
    expect(useLocation.getState().draft.place).toMatchObject({
      label: 'vulytsia Doroshenka 14',
      lat: 49.8401,
      lng: 24.0297,
    });
  });

  it('lists recent places and picks one', async () => {
    useLocation.setState({ recent: [recent] });
    await open();
    expect(screen.getByText('Recent')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /prosp\. Svobody 28/ }));
    expect(useLocation.getState().draft.place).toEqual(recent);
    expect(await screen.findByText('Location screen')).toBeOnTheScreen();
  });

  it('clears the field', async () => {
    await open();
    type('Dorosh');
    fireEvent.press(screen.getByRole('button', { name: 'Clear' }));
    expect(field()).toHaveProp('value', '');
  });

  it('“use my current location” picks the device position', async () => {
    await open();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Use my current location' }));
    });
    await waitFor(() =>
      expect(useLocation.getState().draft.place).toMatchObject({ label: 'Rynok Square 1' }),
    );
    expect(await screen.findByText('Location screen')).toBeOnTheScreen();
  });

  it('explains a denied permission and keeps search usable', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
      granted: false,
    });
    request.mockResolvedValue({ results: suggestions });
    await open();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Use my current location' }));
    });
    expect(screen.getByText('Location access is off')).toBeOnTheScreen();
    type('Dorosh');
    expect(await screen.findByRole('button', { name: /vul\. Doroshenka 14/ })).toBeOnTheScreen();
  });
});
