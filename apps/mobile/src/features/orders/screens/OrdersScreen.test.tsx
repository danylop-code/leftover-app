import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { apiRequest, NetworkError } from '../../../shared/api/client';
import { useLocation } from '../../../shared/store/location';
import { fakeNow } from '../../../shared/testing/fake-date';
import { orderDetail } from '../../../shared/testing/fixtures';
import { routerProviders } from '../../../shared/testing/render';
import { OrdersScreen } from './OrdersScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const ready = orderDetail({ id: 'o-ready', displayStatus: 'ready' });
const upcoming = orderDetail({
  id: 'o-later',
  qty: 2,
  unitPriceMinor: 17900,
  displayStatus: 'reserved',
  bag: {
    id: 'b2',
    title: 'Hot meal bag',
    category: 'meals',
    pickupStart: '2026-09-30T09:30:00.000Z',
    pickupEnd: '2026-09-30T10:30:00.000Z',
    photoUrl: null,
  },
  store: { ...orderDetail().store, id: 's2', name: 'Kasha Kitchen' },
});
const collectedUnrated = orderDetail({
  id: 'o-col',
  status: 'collected',
  displayStatus: 'collected',
});
const collectedRated = orderDetail({
  id: 'o-rated',
  status: 'collected',
  displayStatus: 'collected',
  rating: 5,
});
const cancelled = orderDetail({
  id: 'o-can',
  status: 'cancelled',
  displayStatus: 'cancelled',
  cancelledAt: '2026-09-29T13:40:00.000Z',
});
const missed = orderDetail({ id: 'o-miss', displayStatus: 'missed' });

const serve = (
  current = [ready, upcoming],
  past = [collectedUnrated, collectedRated, cancelled, missed],
) =>
  request.mockImplementation(async (_path: string, { query }: { query: { scope: string } }) => ({
    orders: query.scope === 'current' ? current : past,
    currentCount: current.length,
  }));

const open = async () => {
  renderRouter(
    {
      orders: OrdersScreen,
      'pickup/[orderId]': () => <Text>Pickup screen</Text>,
      'review/[orderId]': () => <Text>Review screen</Text>,
      discover: () => <Text>Discover screen</Text>,
    },
    { initialUrl: '/orders', ...routerProviders() },
  );
  await act(async () => {});
};

beforeEach(() => {
  request.mockReset();
  fakeNow('2026-09-29T15:10:00.000Z');
  useLocation.setState({ selected: { label: 'Home', lat: 49.8421, lng: 24.0224 } });
});
afterEach(() => jest.useRealTimers());

describe('OrdersScreen', () => {
  it('lists current orders: Ready now with Show code, upcoming with View; the badge counts them', async () => {
    serve();
    await open();
    expect(await screen.findByText('Ready now')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Show code' })).toBeOnTheScreen();
    expect(screen.getByText('Reserved')).toBeOnTheScreen();
    expect(screen.getByText('Hot meal bag × 2')).toBeOnTheScreen();
    expect(screen.getByText('₴358')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: /Current/ })).toHaveAccessibleName(/2/);
    fireEvent.press(screen.getByRole('button', { name: 'Show code' }));
    expect(await screen.findByText('Pickup screen')).toBeOnTheScreen();
    expect(screen).toHavePathname('/pickup/o-ready');
  });

  it('past orders: review or “You rated”, cancelled with its time, missed with its note', async () => {
    serve();
    await open();
    await screen.findByText('Ready now');
    fireEvent.press(screen.getByRole('tab', { name: /Past/ }));
    expect(await screen.findByText('You cancelled at 16:40')).toBeOnTheScreen();
    expect(screen.getByText('Pickup window ended')).toBeOnTheScreen();
    expect(screen.getByText('You rated')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Leave a review' })).toHaveLength(1);
    fireEvent.press(screen.getByRole('button', { name: 'Leave a review' }));
    expect(await screen.findByText('Review screen')).toBeOnTheScreen();
    expect(screen).toHavePathname('/review/o-col');
  });

  it('with no current orders: “Find food nearby” leads to Discover', async () => {
    serve([], []);
    await open();
    expect(await screen.findByText('No bags reserved yet')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Find food nearby' }));
    expect(await screen.findByText('Discover screen')).toBeOnTheScreen();
  });

  it('offers Try again when the list can’t load', async () => {
    request.mockRejectedValueOnce(new NetworkError());
    await open();
    expect(await screen.findByText('Couldn’t load your orders')).toBeOnTheScreen();
    serve();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Ready now')).toBeOnTheScreen();
  });
});
