import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { apiRequest } from '../../../shared/api/client';
import { useSession } from '../../../shared/store/session';
import { fakeNow } from '../../../shared/testing/fake-date';
import { customer, orderDetail, shopOwnerUser } from '../../../shared/testing/fixtures';
import { renderWithProviders } from '../../../shared/testing/render';
import { ReportScreen } from './ReportScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const recentOrder = orderDetail({ id: 'o1' });
const oldOrder = orderDetail({
  id: 'o-old',
  bag: { ...orderDetail().bag, pickupStart: '2026-09-01T15:00:00.000Z' },
});

const serve = () =>
  request.mockImplementation(async (path: string, options: { query?: { scope: string } }) => {
    if (path === '/reports') return { reference: 'R-3107' };
    return {
      orders: options.query?.scope === 'past' ? [oldOrder] : [recentOrder],
      currentCount: 1,
    };
  });
const reportCalls = () => request.mock.calls.filter(([path]) => path === '/reports');

const send = () => screen.getByRole('button', { name: 'Send report' });
const type = (text: string) => fireEvent.changeText(screen.getByLabelText('Message'), text);

beforeEach(() => {
  request.mockReset();
  serve();
  fakeNow('2026-09-29T15:00:00.000Z');
  useSession.setState({ status: 'signedIn', token: 'tok', user: customer });
});
afterEach(() => jest.useRealTimers());

describe('ReportScreen', () => {
  it('sends subject, order and message, then shows the reference with the user’s email', async () => {
    renderWithProviders(<ReportScreen />);
    fireEvent.press(screen.getByRole('radio', { name: 'Problem with an order' }));
    fireEvent.press(
      await screen.findByRole('radio', { name: /^Crumb & Co\. Bakery · Bakery surprise bag/ }),
    );
    type('My bag was already given away.');
    await act(async () => {
      fireEvent.press(send());
    });
    expect(reportCalls()[0]?.[1]).toMatchObject({
      method: 'POST',
      body: { subject: 'order', orderId: 'o1', message: 'My bag was already given away.' },
    });
    expect(await screen.findByText('Thanks — we’ve got it')).toBeOnTheScreen();
    expect(
      screen.getByText('Our team will reply to olena@example.com. Reference R-3107.'),
    ).toBeOnTheScreen();
  });

  it('only offers orders from the last 7 days, plus “Not about an order”', async () => {
    renderWithProviders(<ReportScreen />);
    expect(
      await screen.findByRole('radio', { name: /Bakery surprise bag · Today/ }),
    ).toBeOnTheScreen();
    expect(screen.getAllByRole('radio', { name: /Bakery surprise bag/ })).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Not about an order' })).toBeChecked();
  });

  it('keeps Send disabled without a subject, or with a message under 10 or over 500 characters', async () => {
    renderWithProviders(<ReportScreen />);
    await screen.findByRole('radio', { name: 'Not about an order' });
    type('A long enough message.');
    expect(send()).toBeDisabled();
    fireEvent.press(screen.getByRole('radio', { name: 'App isn’t working' }));
    expect(send()).toBeEnabled();
    type('Too short');
    expect(send()).toBeDisabled();
    type('x'.repeat(501));
    expect(send()).toBeDisabled();
    expect(screen.getByText('Use 10–500 characters.')).toBeOnTheScreen();
  });

  it('“Report something else” opens an empty form', async () => {
    renderWithProviders(<ReportScreen />);
    await screen.findByRole('radio', { name: 'Not about an order' });
    fireEvent.press(screen.getByRole('radio', { name: 'Something else' }));
    type('Something odd happened.');
    await act(async () => {
      fireEvent.press(send());
    });
    fireEvent.press(await screen.findByRole('button', { name: 'Report something else' }));
    expect(screen.getByLabelText('Message').props.value).toBe('');
    expect(screen.getByRole('radio', { name: 'Something else' })).not.toBeChecked();
  });

  it('shows shops no order picker', async () => {
    useSession.setState({ user: shopOwnerUser });
    renderWithProviders(<ReportScreen />);
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Payment question' })).toBeOnTheScreen(),
    );
    expect(screen.queryByText('Which order?')).toBeNull();
    expect(request).not.toHaveBeenCalledWith('/orders/me', expect.anything());
  });
});
