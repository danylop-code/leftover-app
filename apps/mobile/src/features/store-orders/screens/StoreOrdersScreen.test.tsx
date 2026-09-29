import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { fakeNow } from '../../../shared/testing/fake-date';
import { storeOrder } from '../../../shared/testing/fixtures';
import { renderWithProviders } from '../../../shared/testing/render';
import { StoreOrdersScreen } from './StoreOrdersScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const olena = storeOrder({ id: 'o1', code: '4827', customerName: 'Olena' });
const taras = storeOrder({
  id: 'o2',
  code: '1234',
  customerName: 'Taras',
  qty: 2,
  bagTitle: 'Sweet box',
  totalMinor: 21800,
});
const iryna = storeOrder({
  id: 'o3',
  customerName: 'Iryna',
  displayStatus: 'collected',
  collectedAt: '2026-09-29T14:48:00.000Z',
});

/** A server whose list reflects confirmed codes. */
const serve = () => {
  let orders = [olena, taras, iryna];
  request.mockImplementation(async (path: string, options: { body?: { code: string } }) => {
    if (path === '/store/orders/confirm') {
      const match = orders.find(
        (o) => o.code === options.body?.code && o.displayStatus !== 'collected',
      );
      if (!match) throw new ApiError(404, 'code_not_found', 'x');
      const done = {
        ...match,
        displayStatus: 'collected' as const,
        collectedAt: '2026-09-29T15:06:00.000Z',
      };
      orders = [...orders.filter((o) => o.id !== match.id), done];
      return done;
    }
    const toCollect = orders.filter((o) => o.displayStatus !== 'collected').length;
    return { timezone: 'Europe/Kyiv', orders, counts: { toCollect, total: orders.length } };
  });
};

const typeCode = (code: string) => fireEvent.changeText(screen.getByLabelText('Digit 1'), code);
const confirmButton = () => screen.getByRole('button', { name: 'Confirm pickup' });

beforeEach(() => {
  request.mockReset();
  fakeNow('2026-09-29T15:00:00.000Z');
});
afterEach(() => jest.useRealTimers());

describe('StoreOrdersScreen', () => {
  it('lists today: date, who’s still to collect and what’s been collected', async () => {
    serve();
    renderWithProviders(<StoreOrdersScreen />);
    expect(await screen.findByText('2 of 3')).toBeOnTheScreen();
    expect(screen.getByText('Tue, 29 Sep')).toBeOnTheScreen();
    expect(screen.getByText('2 × Sweet box · 18:00–19:30')).toBeOnTheScreen();
    expect(screen.getByText('Collected 17:48')).toBeOnTheScreen();
  });

  it('keeps Confirm disabled until all four digits are in', async () => {
    serve();
    renderWithProviders(<StoreOrdersScreen />);
    await screen.findByText('2 of 3');
    typeCode('482');
    expect(confirmButton()).toBeDisabled();
    typeCode('4827');
    expect(confirmButton()).toBeEnabled();
  });

  it('confirms a code: what to hand over, to whom, what to charge; the list moves on', async () => {
    serve();
    renderWithProviders(<StoreOrdersScreen />);
    await screen.findByText('2 of 3');
    typeCode('4827');
    await act(async () => {
      fireEvent.press(confirmButton());
    });
    expect(await screen.findByText('Code 4827 — all good')).toBeOnTheScreen();
    expect(screen.getByText('Take payment')).toBeOnTheScreen();
    expect(screen.getByText(/to Olena/)).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByText('1 of 3')).toBeOnTheScreen());
    expect(screen.getByText('Collected 18:06')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Next code' }));
    expect(screen.getByLabelText('Digit 1').props.value).toBe('');
  });

  it('quotes a wrong code and keeps it in the boxes to fix', async () => {
    serve();
    renderWithProviders(<StoreOrdersScreen />);
    await screen.findByText('2 of 3');
    typeCode('4872');
    await act(async () => {
      fireEvent.press(confirmButton());
    });
    expect(
      await screen.findByText('No order today matches 4872. Check the code and try again.'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Digit 3').props.value).toBe('7');
  });
});
