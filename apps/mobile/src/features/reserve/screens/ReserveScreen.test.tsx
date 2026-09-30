import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { ApiError, apiRequest, NetworkError } from '../../../shared/api/client';
import { useLocation } from '../../../shared/store/location';
import { usePreferences } from '../../../shared/store/preferences';
import { bidiName, stripBidi } from '../../../shared/testing/bidi';
import { storeBag, storeDetail } from '../../../shared/testing/fixtures';
import { routerProviders } from '../../../shared/testing/render';
import { ReserveScreen } from './ReserveScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

type Answer = () => unknown;
const serve = (detail = storeDetail(), reserve: Answer = () => ({ id: 'o1' })) =>
  request.mockImplementation(async (path: string) => (path === '/orders' ? reserve() : detail));
const reserveCalls = () => request.mock.calls.filter(([path]) => path === '/orders');

const open = async (bagId = 'b1') => {
  renderRouter(
    {
      'reserve/[bagId]': ReserveScreen,
      'pickup/[orderId]': () => <Text>Pickup screen</Text>,
      discover: () => <Text>Discover screen</Text>,
    },
    { initialUrl: `/reserve/${bagId}?storeId=s1`, ...routerProviders() },
  );
  await screen.findByText('Reserve bag');
};

const more = () => fireEvent.press(screen.getByRole('button', { name: 'More bags' }));
const submitButton = () => screen.getByRole('button', { name: /^Reserve for/ });

beforeEach(() => {
  request.mockReset();
  useLocation.setState({ selected: { label: 'Home', lat: 49.8421, lng: 24.0224 } });
});

describe('ReserveScreen', () => {
  it('shows the bag, when and where to pick it up, and that payment is at the store', async () => {
    serve();
    await open();
    expect(await screen.findByText('Bakery surprise bag')).toBeOnTheScreen();
    expect(screen.getByText('A mix of today’s bread and pastries.')).toBeOnTheScreen();
    expect(screen.getByText('3 left')).toBeOnTheScreen();
    expect(screen.getByText('Pay at the store')).toBeOnTheScreen();
    expect(screen.getByText(/vul\. Doroshenka 32 · \d/)).toBeOnTheScreen();
    expect(submitButton()).toHaveAccessibleName('Reserve for ₴149');
  });

  it('totals 2 × ₴149 (was ₴450) as ₴298 and “You save ₴602”, from minor units', async () => {
    serve();
    await open();
    await screen.findByText('Bakery surprise bag');
    more();
    expect(screen.getByText('You save ₴602')).toBeOnTheScreen();
    expect(submitButton()).toHaveAccessibleName('Reserve for ₴298');
  });

  describe('in Oman, in Arabic (brief 21)', () => {
    beforeEach(() => {
      process.env.EXPO_PUBLIC_MARKET = 'OM';
      usePreferences.getState().setLanguage('ar');
    });
    afterEach(() => {
      process.env.EXPO_PUBLIC_MARKET = 'UA';
    });

    it('totals 2 × OMR 1.500 (was 4.000) as 3.000 and saves 5.000, in Arabic', async () => {
      const bag = {
        ...storeBag('b1', 'Bakery surprise bag', 3),
        priceMinor: 1500,
        originalPriceMinor: 4000,
      };
      serve(storeDetail({ bags: [bag] }));
      renderRouter(
        { 'reserve/[bagId]': ReserveScreen },
        { initialUrl: '/reserve/b1?storeId=s1', ...routerProviders() },
      );
      expect(await screen.findByText('احجز كيسًا')).toBeOnTheScreen();
      await screen.findByText('Bakery surprise bag');
      fireEvent.press(screen.getByRole('button', { name: 'أكياس أكثر' }));
      expect(screen.getByText('توفّر 5.000 ر.ع.', { normalizer: stripBidi })).toBeOnTheScreen();
      expect(
        screen.getByRole('button', { name: bidiName('احجز مقابل 3.000 ر.ع.') }),
      ).toBeOnTheScreen();
      expect(screen.getByText('ادفع في المتجر')).toBeOnTheScreen();
    });
  });

  it('caps the quantity at what’s left (3), or at 5 per order', async () => {
    serve();
    await open();
    await screen.findByText('Bakery surprise bag');
    more();
    more();
    expect(screen.getByRole('button', { name: 'More bags' })).toBeDisabled();

    serve(storeDetail({ bags: [storeBag('b1', 'Big batch', 8)] }));
    await open();
    await screen.findByText('Big batch');
    for (let i = 0; i < 6; i++) more();
    expect(submitButton()).toHaveAccessibleName('Reserve for ₴745');
  });

  it('reserves the chosen quantity and opens Pickup', async () => {
    serve();
    await open();
    await screen.findByText('Bakery surprise bag');
    more();
    await act(async () => {
      fireEvent.press(submitButton());
    });
    expect(reserveCalls()[0]?.[1]).toMatchObject({ method: 'POST', body: { bagId: 'b1', qty: 2 } });
    expect(await screen.findByText('Pickup screen')).toBeOnTheScreen();
  });

  it('on sold_out shows the sold-out state: nothing reserved, controls disabled, other bags offered', async () => {
    serve(storeDetail(), () => {
      throw new ApiError(409, 'sold_out', 'Just sold out', undefined, { qtyAvailable: 0 });
    });
    await open();
    await screen.findByText('Bakery surprise bag');
    await act(async () => {
      fireEvent.press(submitButton());
    });
    expect(await screen.findByText('Just sold out')).toBeOnTheScreen();
    expect(
      screen.getByText('Someone grabbed the last bag a moment ago. Nothing was reserved.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'More bags' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Fewer bags' })).toBeDisabled();
    expect(screen.getByText('Still available here')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sweet box' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'See other bags nearby' }));
    expect(await screen.findByText('Discover screen')).toBeOnTheScreen();
  });

  it('when fewer are left than asked, lowers the quantity and says so', async () => {
    serve(storeDetail(), () => {
      throw new ApiError(409, 'sold_out', 'x', undefined, { qtyAvailable: 1 });
    });
    await open();
    await screen.findByText('Bakery surprise bag');
    more();
    await act(async () => {
      fireEvent.press(submitButton());
    });
    expect(
      await screen.findByText('Only 1 left now — pick fewer and try again.'),
    ).toBeOnTheScreen();
    expect(submitButton()).toHaveAccessibleName('Reserve for ₴149');
  });

  it('explains a paused or ended bag', async () => {
    serve(storeDetail(), () => {
      throw new ApiError(409, 'not_available', 'x');
    });
    await open();
    await screen.findByText('Bakery surprise bag');
    await act(async () => {
      fireEvent.press(submitButton());
    });
    expect(await screen.findByText('No longer available')).toBeOnTheScreen();
  });

  it('keeps the form on a network error', async () => {
    serve(storeDetail(), () => {
      throw new NetworkError();
    });
    await open();
    await screen.findByText('Bakery surprise bag');
    await act(async () => {
      fireEvent.press(submitButton());
    });
    expect(
      await screen.findByText("Couldn't connect. Check your connection and try again."),
    ).toBeOnTheScreen();
    expect(submitButton()).toBeEnabled();
  });

  it('shows a sold-out bag as sold out straight away', async () => {
    serve();
    await open('b3');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled());
  });
});
