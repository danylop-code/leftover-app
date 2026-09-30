import type { Place } from '@leftover/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { useLocation } from '../../../shared/store/location';
import { DEVICE_POSITION } from '../../../shared/testing/expo-location-mock';
import { createTestQueryClient } from '../../../shared/testing/render';
import { LocationScreen } from './LocationScreen';

const dorosh: Place = {
  label: 'vul. Doroshenka 14',
  secondary: 'Lviv, Ukraine',
  lat: 49.8399,
  lng: 24.0299,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

const open = async () => {
  renderRouter(
    {
      location: LocationScreen,
      'location-search': () => <Text>Search screen</Text>,
      discover: () => <Text>Discover screen</Text>,
    },
    { initialUrl: '/location', wrapper: Wrapper },
  );
  await act(async () => {});
};

const marker = () => screen.getByTestId('map-marker');
const circle = () => screen.getByTestId('map-circle');
const slider = () => screen.getByRole('adjustable', { name: 'Search radius' });
const showResults = () => screen.getByRole('button', { name: 'Show results' });

describe('LocationScreen', () => {
  it('on first open places the pin at the device and labels it', async () => {
    await open();
    await waitFor(() =>
      expect(marker()).toHaveProp('coordinate', {
        latitude: DEVICE_POSITION.latitude,
        longitude: DEVICE_POSITION.longitude,
      }),
    );
    expect(screen.getByText('Rynok Square 1')).toBeOnTheScreen();
    expect(screen.getByText('Lviv, Ukraine')).toBeOnTheScreen();
    expect(showResults()).toBeEnabled();
  });

  it('“use my current location” moves the pin to the device and updates the label', async () => {
    useLocation.setState({ selected: dorosh });
    await open();
    expect(screen.getByText('vul. Doroshenka 14')).toBeOnTheScreen();
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Use my current location' }));
    });
    expect(marker()).toHaveProp('coordinate', {
      latitude: DEVICE_POSITION.latitude,
      longitude: DEVICE_POSITION.longitude,
    });
    expect(screen.getByText('Rynok Square 1')).toBeOnTheScreen();
  });

  it('explains a denied permission and keeps search usable', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
      granted: false,
    });
    await open();
    expect(await screen.findByText('Location access is off')).toBeOnTheScreen();
    expect(showResults()).toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Search street or place' }));
    expect(await screen.findByText('Search screen')).toBeOnTheScreen();
  });

  it('moves the radius in 1 km steps within 1–30, updating the label and the circle', async () => {
    useLocation.setState({ selected: dorosh, radiusKm: 2 });
    await open();
    expect(screen.getByText('2 km')).toBeOnTheScreen();

    fireEvent(slider(), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(screen.getByText('3 km')).toBeOnTheScreen();
    expect(circle()).toHaveProp('radius', 3000);

    fireEvent(slider(), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    fireEvent(slider(), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    fireEvent(slider(), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(slider()).toHaveAccessibilityValue({ min: 1, max: 30, now: 1, text: '1\u00a0km' });
    expect(circle()).toHaveProp('radius', 1000);
  });

  it('labels a dragged pin from the map', async () => {
    useLocation.setState({ selected: dorosh });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
      { street: 'prosp. Svobody', streetNumber: '28', city: 'Lviv', country: 'Ukraine' },
    ]);
    await open();
    await act(async () => {
      fireEvent(marker(), 'dragEnd', {
        nativeEvent: { coordinate: { latitude: 49.8436, longitude: 24.0265 } },
      });
    });
    expect(screen.getByText('prosp. Svobody 28')).toBeOnTheScreen();
  });

  it('“Show results” saves the area and opens Discover', async () => {
    useLocation.setState({ selected: dorosh, radiusKm: 5 });
    await open();
    fireEvent(slider(), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(useLocation.getState().radiusKm).toBe(5);

    fireEvent.press(showResults());
    expect(useLocation.getState()).toMatchObject({ selected: dorosh, radiusKm: 6 });
    expect(await screen.findByText('Discover screen')).toBeOnTheScreen();
  });

  it('offers Back only once a location has been chosen before', async () => {
    await open();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });
});
