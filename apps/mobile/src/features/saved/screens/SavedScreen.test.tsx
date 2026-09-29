import type { SavedShop } from '@leftover/shared';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { apiRequest, NetworkError } from '../../../shared/api/client';
import { useLocation } from '../../../shared/store/location';
import { routerProviders } from '../../../shared/testing/render';
import { SavedScreen } from './SavedScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const shop = (id: string, name: string, bagsAvailable: number, distanceKm: number): SavedShop => ({
  store: { id, name, category: 'bakery', address: 'Street 1' },
  distanceKm,
  rating: null,
  bagsAvailable,
});
const crumb = shop('s1', 'Crumb & Co. Bakery', 2, 0.8);
const kasha = shop('s2', 'Kasha Kitchen', 0, 1.4);

const open = async () => {
  renderRouter(
    {
      saved: SavedScreen,
      'store/[id]': () => <Text>Store screen</Text>,
      discover: () => <Text>Discover screen</Text>,
    },
    { initialUrl: '/saved', ...routerProviders() },
  );
  await act(async () => {});
};

beforeEach(() => {
  request.mockReset();
  useLocation.setState({ selected: { label: 'Home', lat: 49.8421, lng: 24.0224 } });
});

describe('SavedScreen', () => {
  it('lists saved shops with distance and what they have today, from the selected location', async () => {
    request.mockResolvedValue({ shops: [crumb, kasha] });
    await open();
    expect(await screen.findByText('Bakery · 0.8 km · 2 bags today')).toBeOnTheScreen();
    expect(screen.getByText('Bakery · 1.4 km · No bags right now')).toBeOnTheScreen();
    expect(request).toHaveBeenCalledWith(
      '/favorites',
      expect.objectContaining({ query: { lat: 49.8421, lng: 24.0224 } }),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Crumb & Co. Bakery' }));
    expect(await screen.findByText('Store screen')).toBeOnTheScreen();
  });

  it('unsaving drops the shop from the list at once', async () => {
    let saved = [crumb, kasha];
    request.mockImplementation(async (path: string, options: { method?: string }) => {
      if (options.method === 'DELETE') {
        saved = saved.filter((s) => !path.endsWith(s.store.id));
        return undefined;
      }
      return { shops: saved };
    });
    await open();
    await screen.findByText('Kasha Kitchen');
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Unsave Kasha Kitchen' }));
    });
    await waitFor(() => expect(screen.queryByText('Kasha Kitchen')).toBeNull());
    expect(request).toHaveBeenCalledWith(
      '/favorites/s2',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('without saves, explains the heart and leads to Discover', async () => {
    request.mockResolvedValue({ shops: [] });
    await open();
    expect(await screen.findByText('No saved shops yet')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Find food nearby' }));
    expect(await screen.findByText('Discover screen')).toBeOnTheScreen();
  });

  it('offers Try again when the list can’t load', async () => {
    request.mockRejectedValueOnce(new NetworkError()).mockResolvedValue({ shops: [crumb] });
    await open();
    fireEvent.press(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Crumb & Co. Bakery')).toBeOnTheScreen();
  });
});
