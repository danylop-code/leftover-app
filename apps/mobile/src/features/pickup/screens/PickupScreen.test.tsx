import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Linking, Text } from 'react-native';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { orderPollInterval } from '../../../shared/api/use-order';
import { ORDER_POLL_MS } from '../../../shared/constants/orders';
import { useLocation } from '../../../shared/store/location';
import { fakeNow } from '../../../shared/testing/fake-date';
import { orderDetail } from '../../../shared/testing/fixtures';
import { routerProviders } from '../../../shared/testing/render';
import { PickupScreen } from './PickupScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const open = async () => {
  renderRouter(
    {
      'pickup/[orderId]': PickupScreen,
      'review/[orderId]': () => <Text>Review screen</Text>,
      discover: () => <Text>Discover screen</Text>,
    },
    { initialUrl: '/pickup/o1', ...routerProviders() },
  );
  await act(async () => {});
};

beforeEach(() => {
  request.mockReset();
  useLocation.setState({ selected: { label: 'Home', lat: 49.8421, lng: 24.0224 } });
});
afterEach(() => jest.useRealTimers());

describe('PickupScreen', () => {
  it('before the window: the code, what to pay, and a countdown to opening', async () => {
    fakeNow('2026-09-29T13:36:00.000Z'); // 84 min before 15:00Z
    request.mockResolvedValue(orderDetail());
    await open();
    expect(await screen.findByText('4827')).toBeOnTheScreen();
    expect(screen.getByText('Show this code at the counter')).toBeOnTheScreen();
    expect(screen.getByText('1 × Bakery surprise bag · pay ₴149 in store')).toBeOnTheScreen();
    expect(screen.getByText(/^Order LF-\d{5}$/)).toBeOnTheScreen();
    expect(screen.getByText('Pickup opens in')).toBeOnTheScreen();
    expect(screen.getByText('1 h 24 min')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancel reservation' })).toBeOnTheScreen();
  });

  it('inside the window: Ready now, until the end time', async () => {
    fakeNow('2026-09-29T15:10:00.000Z');
    request.mockResolvedValue(orderDetail());
    await open();
    expect(await screen.findAllByText('Ready now')).not.toHaveLength(0);
    expect(screen.getByText('Until 19:30')).toBeOnTheScreen();
  });

  it('after the window: ended (missed), and Cancel is gone', async () => {
    fakeNow('2026-09-29T17:00:00.000Z');
    request.mockResolvedValue(orderDetail());
    await open();
    expect(await screen.findByText('Pickup window ended')).toBeOnTheScreen();
    expect(screen.getByText('Missed')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancel reservation' })).toBeNull();
  });

  it('cancels after confirming in the sheet', async () => {
    fakeNow('2026-09-29T13:36:00.000Z');
    const cancelled = orderDetail({
      status: 'cancelled',
      displayStatus: 'cancelled',
      cancelledAt: '2026-09-29T13:40:00.000Z',
    });
    let current = orderDetail();
    request.mockImplementation(async (path: string) => {
      if (path.endsWith('/cancel')) current = cancelled;
      return current;
    });
    await open();
    fireEvent.press(await screen.findByRole('button', { name: 'Cancel reservation' }));
    expect(screen.getByText('Cancel this reservation?')).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(
        screen.getAllByRole('button', { name: 'Cancel reservation' }).at(-1) as never,
      );
    });
    expect(request).toHaveBeenCalledWith(
      '/orders/o1/cancel',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(await screen.findByText('Reservation cancelled')).toBeOnTheScreen();
    expect(screen.getByText('You cancelled at 16:40. The bag is back on sale.')).toBeOnTheScreen();
  });

  it('opens directions to the shop', async () => {
    fakeNow('2026-09-29T13:36:00.000Z');
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    request.mockResolvedValue(orderDetail());
    await open();
    fireEvent.press(await screen.findByRole('button', { name: 'Directions' }));
    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('49.8393,24.0325'));
    openURL.mockRestore();
  });

  it('once collected: the summary, what it saved, and stars that open Review preselected', async () => {
    fakeNow('2026-09-29T15:20:00.000Z');
    request.mockResolvedValue(
      orderDetail({
        status: 'collected',
        displayStatus: 'collected',
        collectedAt: '2026-09-29T15:12:00.000Z',
      }),
    );
    await open();
    expect(await screen.findByText('Enjoy your haul!')).toBeOnTheScreen();
    expect(
      screen.getByText('You collected 1 bag from Crumb & Co. Bakery at 18:12.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('You saved ₴301')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: '4 stars' }));
    expect(await screen.findByText('Review screen')).toBeOnTheScreen();
    expect(screen).toHavePathname('/review/o1');
    expect(screen).toHaveSearchParams({ overall: '4', orderId: 'o1' });
  });

  it('once collected and rated, thanks instead of asking again', async () => {
    fakeNow('2026-09-29T15:20:00.000Z');
    request.mockResolvedValue(
      orderDetail({
        status: 'collected',
        displayStatus: 'collected',
        collectedAt: '2026-09-29T15:12:00.000Z',
        rating: 5,
      }),
    );
    await open();
    expect(await screen.findByText('Thanks — you rated this bag')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Leave a review' })).toBeNull();
  });

  it('shows not-found for someone else’s or an unknown order', async () => {
    request.mockRejectedValue(new ApiError(404, 'not_found', 'No such order.'));
    await open();
    expect(await screen.findByText('We couldn’t find this order.')).toBeOnTheScreen();
  });
});

describe('orderPollInterval', () => {
  it('polls while the order waits for pickup and stops afterwards', () => {
    expect(orderPollInterval(orderDetail({ displayStatus: 'reserved' }))).toBe(ORDER_POLL_MS);
    expect(orderPollInterval(orderDetail({ displayStatus: 'ready' }))).toBe(ORDER_POLL_MS);
    expect(orderPollInterval(orderDetail({ displayStatus: 'collected' }))).toBe(false);
    expect(orderPollInterval(orderDetail({ displayStatus: 'missed' }))).toBe(false);
    expect(orderPollInterval(undefined)).toBe(false);
  });
});
