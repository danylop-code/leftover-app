import type { Place } from '@leftover/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import type { ReactNode } from 'react';
import { Linking, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApiError, apiRequest, NetworkError } from '../../../shared/api/client';
import { useLocation } from '../../../shared/store/location';
import { storeDetail } from '../../../shared/testing/fixtures';
import { createTestQueryClient, testSafeArea } from '../../../shared/testing/render';
import { StoreDetailScreen } from './StoreDetailScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const home: Place = { label: 'vul. Doroshenka 14', lat: 49.8421, lng: 24.0224 };

const crumb = storeDetail();

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider initialMetrics={testSafeArea}>
    <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
  </SafeAreaProvider>
);

// Opened from Discover, so Back returns there.
const open = async () => {
  renderRouter(
    {
      discover: () => <Text>Discover screen</Text>,
      'store/[id]': StoreDetailScreen,
      'reserve/[bagId]': () => <Text>Reserve screen</Text>,
    },
    { initialUrl: '/discover', wrapper: Wrapper },
  );
  const { router } = jest.requireActual('expo-router');
  await act(async () => router.push('/store/s1'));
};

beforeEach(() => {
  request.mockReset();
  useLocation.setState({ selected: home, radiusKm: 5 });
});

describe('StoreDetailScreen', () => {
  it('shows the shop, its hours, where it is and how far from the selected location', async () => {
    request.mockResolvedValue(crumb);
    await open();
    expect(await screen.findByText('Crumb & Co. Bakery')).toBeOnTheScreen();
    expect(request).toHaveBeenCalledWith(
      '/stores/s1',
      expect.objectContaining({ query: { lat: home.lat, lng: home.lng } }),
    );
    expect(screen.getByText('Open today 08:00–20:00')).toBeOnTheScreen();
    expect(screen.getByText('vul. Doroshenka 32')).toBeOnTheScreen();
    expect(screen.getByText('0.8 km away')).toBeOnTheScreen();
  });

  it('counts available bags and shows a sold-out one as “Sold out · Back tomorrow”, disabled', async () => {
    request.mockResolvedValue(crumb);
    await open();
    expect(await screen.findByText('2 of 3')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Bakery surprise bag/ })).toBeEnabled();
    const soldOut = screen.getByLabelText('Bread-only bag. Sold out · Back tomorrow');
    expect(soldOut).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Bread-only bag/ })).toBeNull();
    expect(screen.getByText('Back tomorrow')).toBeOnTheScreen();
  });

  it.each([
    ['afterClosing', 'Closed now · opens tomorrow at 08:00'],
    ['beforeOpening', 'Closed now · opens at 08:00'],
  ] as const)('says the shop is closed (%s)', async (openStatus, copy) => {
    request.mockResolvedValue({ ...crumb, openStatus });
    await open();
    expect(await screen.findByText(copy)).toBeOnTheScreen();
    expect(screen.queryByText('Open today 08:00–20:00')).toBeNull();
  });

  it('hides ratings until the shop has some (no “0.0”)', async () => {
    request.mockResolvedValue(crumb);
    await open();
    await screen.findByText('Crumb & Co. Bakery');
    expect(screen.queryByText('Ratings')).toBeNull();
    expect(screen.queryByText(/0\.0/)).toBeNull();
  });

  it('shows the average and count once rated', async () => {
    request.mockResolvedValue({
      ...crumb,
      rating: {
        average: 4.7,
        count: 128,
        aspects: { quality: 4.8, variety: null, freshness: 4.9, ease: 4.6 },
      },
    });
    await open();
    expect(await screen.findByText('Ratings')).toBeOnTheScreen();
    expect(screen.getAllByText('128 ratings').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('4.7 out of 5')).toBeOnTheScreen();
  });

  it('opens the maps app at the shop’s coordinates', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    request.mockResolvedValue(crumb);
    await open();
    fireEvent.press(await screen.findByRole('button', { name: 'Directions' }));
    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('49.8393,24.0325'));
    openURL.mockRestore();
  });

  it('shows a not-found state with Back for an unknown shop', async () => {
    request.mockRejectedValue(new ApiError(404, 'not_found', 'This shop doesn’t exist.'));
    await open();
    expect(await screen.findByText('This shop isn’t available')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('Discover screen')).toBeOnTheScreen();
  });

  it('offers Try again when offline', async () => {
    request.mockRejectedValueOnce(new NetworkError()).mockResolvedValue(crumb);
    await open();
    expect(await screen.findByText('Couldn’t load this shop')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Crumb & Co. Bakery')).toBeOnTheScreen();
  });

  it('shows per-aspect bars and recent reviews once rated', async () => {
    request.mockResolvedValue({
      ...crumb,
      rating: {
        average: 4.7,
        count: 3,
        aspects: { quality: 4.8, variety: null, freshness: 4.9, ease: null },
      },
      recentReviews: [
        {
          id: 'r1',
          authorName: 'Mariana',
          overall: 5,
          text: 'Lovely value.',
          createdAt: '2026-09-27T10:00:00.000Z',
        },
      ],
    });
    await open();
    expect(await screen.findByLabelText('Quality 4.8 out of 5')).toBeOnTheScreen();
    expect(screen.getByLabelText('Freshness 4.9 out of 5')).toBeOnTheScreen();
    expect(screen.queryByText('Variety')).toBeNull();
    expect(screen.getByText('Recent reviews')).toBeOnTheScreen();
    expect(screen.getByText('Mariana')).toBeOnTheScreen();
    expect(screen.getByText('Lovely value.')).toBeOnTheScreen();
  });

  it('opens Reserve for an available bag', async () => {
    request.mockResolvedValue(crumb);
    await open();
    fireEvent.press(await screen.findByRole('button', { name: /^Sweet box/ }));
    expect(await screen.findByText('Reserve screen')).toBeOnTheScreen();
    expect(screen).toHavePathname('/reserve/b2');
    expect(screen).toHaveSearchParams({ bagId: 'b2', storeId: 's1' });
  });

  it('saves the shop with the heart in the header', async () => {
    let saved = false;
    request.mockImplementation(async (path: string, options: { method?: string }) => {
      if (path.startsWith('/favorites/')) {
        saved = options.method === 'PUT';
        return undefined;
      }
      return { ...crumb, isFavorite: saved };
    });
    await open();
    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Save Crumb & Co. Bakery' }));
    });
    expect(await screen.findByRole('button', { name: 'Unsave Crumb & Co. Bakery' })).toBeSelected();
  });
});
