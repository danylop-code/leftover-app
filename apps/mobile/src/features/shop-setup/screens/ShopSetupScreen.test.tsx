import type { Me } from '@leftover/shared';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { apiRequest } from '../../../shared/api/client';
import { useSession } from '../../../shared/store/session';
import { renderWithProviders } from '../../../shared/testing/render';
import { ShopSetupScreen } from './ShopSetupScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
jest.mock('expo-location', () => ({ geocodeAsync: jest.fn() }));

const request = apiRequest as jest.Mock;
const geocode = Location.geocodeAsync as jest.Mock;

const owner: Me = {
  id: 'u2',
  email: 'taras@example.com',
  firstName: 'Taras',
  role: 'store',
  createdAt: '2026-09-29T10:00:00.000Z',
  storeId: null,
};

const marker = () => screen.getByTestId('map-marker');

const fillBasics = () => {
  fireEvent.changeText(screen.getByLabelText('Shop name'), 'Crumb & Co. Bakery');
  fireEvent.press(screen.getByRole('button', { name: 'Bakery' }));
  fireEvent.changeText(screen.getByLabelText('Opens at'), '8:00');
  fireEvent(screen.getByLabelText('Opens at'), 'blur');
  fireEvent.changeText(screen.getByLabelText('Closes at'), '20:00');
};

const findAddress = async (address = 'vul. Doroshenka 32, Lviv') => {
  fireEvent.changeText(screen.getByLabelText('Address'), address);
  await act(async () => {
    fireEvent(screen.getByLabelText('Address'), 'submitEditing');
  });
};

const save = () => fireEvent.press(screen.getByRole('button', { name: 'Save and continue' }));

beforeEach(() => {
  request.mockReset();
  geocode.mockReset();
  useSession.setState({ status: 'signedIn', token: 'tok', user: owner, justRegistered: false });
});

describe('ShopSetupScreen', () => {
  it('blocks save with inline errors when fields are missing and the pin is not placed', () => {
    renderWithProviders(<ShopSetupScreen />);
    save();
    expect(screen.getByText('Enter your shop’s name (2–60 characters).')).toBeOnTheScreen();
    expect(screen.getByText('Pick a category.')).toBeOnTheScreen();
    expect(screen.getByText('Enter the street address (3–120 characters).')).toBeOnTheScreen();
    expect(screen.getByText('Find your address or drag the pin to your shop.')).toBeOnTheScreen();
    expect(request).not.toHaveBeenCalled();
  });

  it('rejects closing time not after opening time on the closing field', async () => {
    geocode.mockResolvedValue([{ latitude: 49.8393, longitude: 24.0325 }]);
    renderWithProviders(<ShopSetupScreen />);
    fillBasics();
    fireEvent.changeText(screen.getByLabelText('Closes at'), '07:00');
    await findAddress();
    save();
    expect(screen.getByText('Closing time must be after opening time.')).toBeOnTheScreen();
    expect(request).not.toHaveBeenCalled();
  });

  it('moves the pin to the geocoded address', async () => {
    geocode.mockResolvedValue([{ latitude: 49.8393, longitude: 24.0325 }]);
    renderWithProviders(<ShopSetupScreen />);
    await findAddress();
    expect(geocode).toHaveBeenCalledWith('vul. Doroshenka 32, Lviv');
    expect(marker()).toHaveProp('coordinate', { latitude: 49.8393, longitude: 24.0325 });
  });

  it('tells the owner when the address cannot be found', async () => {
    geocode.mockResolvedValue([]);
    renderWithProviders(<ShopSetupScreen />);
    await findAddress('nowhere at all');
    expect(
      screen.getByText('We couldn’t find that address. Drag the pin to your shop instead.'),
    ).toBeOnTheScreen();
  });

  it('dragging the pin updates the location without changing the typed address', async () => {
    geocode.mockResolvedValue([{ latitude: 49.8393, longitude: 24.0325 }]);
    request.mockResolvedValue({ id: 's1' });
    renderWithProviders(<ShopSetupScreen />);
    fillBasics();
    await findAddress();
    fireEvent(marker(), 'dragEnd', {
      nativeEvent: { coordinate: { latitude: 49.84, longitude: 24.03 } },
    });
    expect(screen.getByLabelText('Address')).toHaveProp('value', 'vul. Doroshenka 32, Lviv');
    save();
    await waitFor(() => expect(request).toHaveBeenCalled());
    expect(request.mock.calls[0]?.[1].body).toMatchObject({ lat: 49.84, lng: 24.03 });
  });

  it('saves the profile and records the new shop on the session', async () => {
    geocode.mockResolvedValue([{ latitude: 49.8393, longitude: 24.0325 }]);
    request.mockResolvedValue({
      id: 's1',
      name: 'Crumb & Co. Bakery',
      category: 'bakery',
      address: 'vul. Doroshenka 32, Lviv',
      lat: 49.8393,
      lng: 24.0325,
      opensAt: '08:00',
      closesAt: '20:00',
      timezone: 'Europe/Kyiv',
    });
    renderWithProviders(<ShopSetupScreen />);
    fillBasics();
    await findAddress();
    save();
    await waitFor(() => expect(useSession.getState().user?.storeId).toBe('s1'));
    expect(request).toHaveBeenCalledWith(
      '/stores/me',
      expect.objectContaining({
        method: 'POST',
        body: {
          name: 'Crumb & Co. Bakery',
          category: 'bakery',
          address: 'vul. Doroshenka 32, Lviv',
          lat: 49.8393,
          lng: 24.0325,
          opensAt: '08:00',
          closesAt: '20:00',
          timezone: 'Europe/Kyiv',
        },
      }),
    );
  });
});
