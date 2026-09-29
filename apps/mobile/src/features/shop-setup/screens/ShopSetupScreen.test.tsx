import type { Me, PlaceSuggestion } from '@leftover/shared';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { apiRequest } from '../../../shared/api/client';
import { useSession } from '../../../shared/store/session';
import { renderWithProviders } from '../../../shared/testing/render';
import { ShopSetupScreen } from './ShopSetupScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));

const request = apiRequest as jest.Mock;

const suggestion: PlaceSuggestion = {
  id: 'N32',
  label: 'vul. Doroshenka 32',
  secondary: 'Lviv, Ukraine',
  lat: 49.8393,
  lng: 24.0325,
};

// Address suggestions come from the API; saving answers with the created store.
const serve = (store: unknown = { id: 's1' }, results = [suggestion]) =>
  request.mockImplementation(async (path: string) =>
    path === '/geo/autocomplete' ? { results } : store,
  );
const saveCalls = () => request.mock.calls.filter(([path]) => path === '/stores/me');

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

const pickAddress = async () => {
  fireEvent.changeText(screen.getByLabelText('Address'), 'Dorosh');
  const row = await screen.findByRole('button', { name: /vul\. Doroshenka 32/ });
  await act(async () => {
    fireEvent.press(row);
  });
  // Picking closes the list.
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: /vul\. Doroshenka 32/ })).toBeNull(),
  );
};

const save = () => fireEvent.press(screen.getByRole('button', { name: 'Save and continue' }));

beforeEach(() => {
  request.mockReset();
  useSession.setState({ status: 'signedIn', token: 'tok', user: owner });
});

describe('ShopSetupScreen', () => {
  it('blocks save with inline errors when fields are missing and the pin is not placed', () => {
    renderWithProviders(<ShopSetupScreen />);
    save();
    expect(screen.getByText('Enter your shop’s name (2–60 characters).')).toBeOnTheScreen();
    expect(screen.getByText('Pick a category.')).toBeOnTheScreen();
    expect(screen.getByText('Enter the street address (3–120 characters).')).toBeOnTheScreen();
    expect(
      screen.getByText('Pick your address from the suggestions, or drag the pin to your shop.'),
    ).toBeOnTheScreen();
    expect(saveCalls()).toHaveLength(0);
  });

  it('rejects closing time not after opening time on the closing field', async () => {
    serve();
    renderWithProviders(<ShopSetupScreen />);
    fillBasics();
    fireEvent.changeText(screen.getByLabelText('Closes at'), '07:00');
    await pickAddress();
    save();
    expect(screen.getByText('Closing time must be after opening time.')).toBeOnTheScreen();
    expect(saveCalls()).toHaveLength(0);
  });

  it('suggests addresses while typing, biased to the pin; picking one fills it and moves the pin', async () => {
    serve();
    renderWithProviders(<ShopSetupScreen />);
    await pickAddress();
    expect(request).toHaveBeenCalledWith(
      '/geo/autocomplete',
      expect.objectContaining({ query: { q: 'Dorosh', lat: 49.8397, lng: 24.0297 } }),
    );
    expect(screen.getByLabelText('Address')).toHaveProp('value', 'vul. Doroshenka 32');
    expect(marker()).toHaveProp('coordinate', { latitude: 49.8393, longitude: 24.0325 });
  });

  it('says so when nothing matches', async () => {
    serve({ id: 's1' }, []);
    renderWithProviders(<ShopSetupScreen />);
    fireEvent.changeText(screen.getByLabelText('Address'), 'nowhere at all');
    expect(await screen.findByText('No matches. Try a street name or a place.')).toBeOnTheScreen();
  });

  it('dragging the pin updates the location without changing the address', async () => {
    serve();
    renderWithProviders(<ShopSetupScreen />);
    fillBasics();
    await pickAddress();
    fireEvent(marker(), 'dragEnd', {
      nativeEvent: { coordinate: { latitude: 49.84, longitude: 24.03 } },
    });
    expect(screen.getByLabelText('Address')).toHaveProp('value', 'vul. Doroshenka 32');
    save();
    await waitFor(() => expect(saveCalls()).toHaveLength(1));
    expect(saveCalls()[0]?.[1].body).toMatchObject({ lat: 49.84, lng: 24.03 });
  });

  it('saves the profile and records the new shop on the session', async () => {
    serve({
      id: 's1',
      name: 'Crumb & Co. Bakery',
      category: 'bakery',
      address: 'vul. Doroshenka 32',
      lat: 49.8393,
      lng: 24.0325,
      opensAt: '08:00',
      closesAt: '20:00',
      timezone: 'Europe/Kyiv',
    });
    renderWithProviders(<ShopSetupScreen />);
    fillBasics();
    await pickAddress();
    save();
    await waitFor(() => expect(useSession.getState().user?.storeId).toBe('s1'));
    expect(request).toHaveBeenCalledWith(
      '/stores/me',
      expect.objectContaining({
        method: 'POST',
        body: {
          name: 'Crumb & Co. Bakery',
          category: 'bakery',
          address: 'vul. Doroshenka 32',
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
