import type { NearbyBag, Place } from '@leftover/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApiError, apiRequest, NetworkError } from '../../../shared/api/client';
import { useLocation } from '../../../shared/store/location';
import { nearbyBag } from '../../../shared/testing/fixtures';
import { createTestQueryClient, testSafeArea } from '../../../shared/testing/render';
import { color } from '../../../shared/theme';
import { DiscoverScreen } from './DiscoverScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const home: Place = { label: 'vul. Doroshenka 14', lat: 49.8421, lng: 24.0224 };
const elsewhere: Place = { label: 'Rynok Square 1', lat: 49.8419, lng: 24.0315 };

const bag = nearbyBag;
const crumb = bag({ id: 'b1' });
const kasha = bag({
  id: 'b2',
  title: 'Hot meal bag',
  category: 'meals',
  qtyAvailable: 1,
  store: { id: 's2', name: 'Kasha Kitchen', timezone: 'Europe/Kyiv', logoUrl: null },
  distanceKm: 1.4,
});

/** Answers /bags/nearby like the API: filtered by category when one is asked for. */
const serve = (all: NearbyBag[]) =>
  request.mockImplementation(
    async (_path: string, { query }: { query: { category?: string } }) => ({
      bags: all.filter((b) => !query.category || b.category === query.category),
    }),
  );
const lastQuery = () => request.mock.calls.at(-1)?.[1].query;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider initialMetrics={testSafeArea}>
    <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
  </SafeAreaProvider>
);

const open = () =>
  renderRouter(
    {
      discover: DiscoverScreen,
      location: () => <Text>Location screen</Text>,
      'store/[id]': () => <Text>Store screen</Text>,
    },
    { initialUrl: '/discover', wrapper: Wrapper },
  );

const card = (title: string) => screen.getByRole('button', { name: new RegExp(`^${title} from`) });

beforeEach(() => {
  request.mockReset();
  useLocation.setState({ selected: home, radiusKm: 5 });
});

describe('DiscoverScreen', () => {
  it('lists nearby bags nearest first, with distances from the selected location', async () => {
    serve([crumb, kasha]);
    open();
    expect(await screen.findByText('2 bags')).toBeOnTheScreen();
    expect(lastQuery()).toEqual({ lat: home.lat, lng: home.lng, radiusKm: 5 });
    expect(request).toHaveBeenCalledWith('/bags/nearby', expect.anything());

    const titles = screen
      .getAllByRole('button', { name: / from / })
      .map((c) => c.props.accessibilityLabel);
    expect(titles[0]).toMatch(/^Bakery surprise bag from Crumb/);
    expect(titles[1]).toMatch(/^Hot meal bag from Kasha/);
    expect(screen.getByText('0.8 km')).toBeOnTheScreen();
    expect(screen.getByText('1.4 km')).toBeOnTheScreen();
  });

  it('shows the location and radius in the pill; the pill and map button open Location', async () => {
    serve([crumb]);
    open();
    const pill = await screen.findByRole('button', {
      name: 'Pickup near vul. Doroshenka 14, 5 km. Change location',
    });
    fireEvent.press(pill);
    expect(await screen.findByText('Location screen')).toBeOnTheScreen();
  });

  it('marks a last-bag stock in the low-stock style', async () => {
    serve([crumb, kasha]);
    open();
    expect(await screen.findByText('1 left')).toHaveStyle({ color: color.accentPressed });
    expect(screen.getByText('3 left')).toHaveStyle({ color: color.textPrimary });
  });

  it('filters by category, and the count follows the filter', async () => {
    serve([crumb, kasha]);
    open();
    await screen.findByText('2 bags');
    fireEvent.press(screen.getByRole('button', { name: 'Bakery' }));
    expect(await screen.findByText('1 bag')).toBeOnTheScreen();
    expect(lastQuery()).toMatchObject({ category: 'bakery' });
    expect(card('Bakery surprise bag')).toBeOnTheScreen();
    expect(screen.queryByText('Hot meal bag')).toBeNull();
    expect(screen.getByRole('button', { name: 'Bakery' })).toBeSelected();
  });

  it('refetches when the location changes and never shows the old distances', async () => {
    serve([crumb]);
    open();
    await screen.findByText('0.8 km');

    const pending: ((value: unknown) => void)[] = [];
    request.mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
    act(() => {
      useLocation.setState({ selected: elsewhere, radiusKm: 5 });
    });
    expect(await screen.findByText('Finding bags…')).toBeOnTheScreen();
    expect(screen.queryByText('0.8 km')).toBeNull();
    expect(lastQuery()).toEqual({ lat: elsewhere.lat, lng: elsewhere.lng, radiusKm: 5 });

    await act(async () => {
      for (const resolve of pending) resolve({ bags: [{ ...crumb, distanceKm: 0.3 }] });
    });
    expect(await screen.findByText('0.3 km')).toBeOnTheScreen();
  });

  it('with a category filter and no results, offers “Show all categories”, which resets it', async () => {
    serve([crumb]);
    useLocation.setState({ radiusKm: 2 });
    open();
    await screen.findByText('1 bag');
    fireEvent.press(screen.getByRole('button', { name: 'Meals' }));
    expect(await screen.findByText('Nothing nearby right now')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'No meal bags within 2 km yet. Shops add bags through the day — try a wider area.',
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Show all categories' }));
    expect(await screen.findByText('1 bag')).toBeOnTheScreen();
    expect(lastQuery()).not.toHaveProperty('category');
  });

  it('without a filter, the empty state only offers Change location', async () => {
    serve([]);
    open();
    expect(await screen.findByText('Nothing nearby right now')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Show all categories' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Change location' }));
    expect(await screen.findByText('Location screen')).toBeOnTheScreen();
  });

  it('shows the offline error, and Try again refetches', async () => {
    request.mockRejectedValue(new NetworkError());
    open();
    expect(await screen.findByText('Couldn’t load bags')).toBeOnTheScreen();
    expect(
      screen.getByText('Looks like you’re offline. Check your connection and try again.'),
    ).toBeOnTheScreen();

    serve([crumb]);
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('1 bag')).toBeOnTheScreen();
  });

  it('uses server copy when the API fails', async () => {
    request.mockRejectedValue(new ApiError(500, 'internal', 'boom'));
    open();
    expect(
      await screen.findByText('Something went wrong on our side. Please try again in a moment.'),
    ).toBeOnTheScreen();
  });

  it('refreshes on pull', async () => {
    serve([crumb]);
    open();
    await screen.findByText('1 bag');
    const calls = request.mock.calls.length;
    await act(async () => {
      fireEvent(screen.getByTestId('discover-list'), 'refresh');
    });
    await waitFor(() => expect(request.mock.calls.length).toBe(calls + 1));
  });

  it('opens the bag’s shop', async () => {
    serve([crumb]);
    open();
    fireEvent.press(await screen.findByRole('button', { name: /^Bakery surprise bag from/ }));
    expect(await screen.findByText('Store screen')).toBeOnTheScreen();
    expect(screen).toHavePathname('/store/s1');
  });

  it('shows the shop’s rating on its cards, and none without reviews', async () => {
    serve([{ ...crumb, rating: { average: 4.7, count: 128 } }, kasha]);
    open();
    await screen.findByText('2 bags');
    expect(screen.getByText('4.7')).toBeOnTheScreen();
    expect(screen.getAllByText(/^\d\.\d$/)).toHaveLength(1);
  });

  it('saves a shop with the heart: every card of that shop fills at once', async () => {
    const crumbSweet = bag({ id: 'b9', title: 'Sweet box' });
    let saved = false;
    request.mockImplementation(async (path: string, options: { method?: string }) => {
      if (path.startsWith('/favorites/')) {
        saved = options.method === 'PUT';
        return undefined;
      }
      return {
        bags: [crumb, crumbSweet, kasha].map((b) => ({
          ...b,
          isFavorite: saved && b.store.id === 's1',
        })),
      };
    });
    open();
    await screen.findByText('3 bags');
    await act(async () => {
      fireEvent.press(
        screen.getAllByRole('button', { name: 'Save Crumb & Co. Bakery' })[0] as never,
      );
    });
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Unsave Crumb & Co. Bakery' })).toHaveLength(2),
    );
    expect(screen.getAllByRole('button', { name: 'Unsave Crumb & Co. Bakery' })[0]).toBeSelected();
    expect(screen.getByRole('button', { name: 'Save Kasha Kitchen' })).not.toBeSelected();
    expect(request).toHaveBeenCalledWith(
      '/favorites/s1',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('puts the heart back and explains when saving fails', async () => {
    request.mockImplementation(async (path: string) => {
      if (path.startsWith('/favorites/')) throw new NetworkError();
      return { bags: [crumb] };
    });
    open();
    await screen.findByText('1 bag');
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Save Crumb & Co. Bakery' }));
    });
    expect(
      await screen.findByText('Couldn’t update your saved shops. Try again.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Save Crumb & Co. Bakery' })).not.toBeSelected();
  });
});
