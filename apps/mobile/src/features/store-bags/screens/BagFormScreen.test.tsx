import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { fakeNow } from '../../../shared/testing/fake-date';
import { shopBag, shopBags } from '../../../shared/testing/fixtures';
import { routerProviders } from '../../../shared/testing/render';
import { BagFormScreen } from './BagFormScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const existing = shopBag({ id: 'b1', qtyTotal: 5, qtyAvailable: 2, reservedCount: 3 });

const serve = (write: () => unknown = () => existing) =>
  request.mockImplementation(async (_path: string, options: { method?: string }) =>
    options.method ? write() : shopBags([existing]),
  );
const writes = () => request.mock.calls.filter(([, options]) => options.method);

const open = async (path: string) => {
  renderRouter(
    {
      bags: () => <Text>My bags</Text>,
      'bag/new': BagFormScreen,
      'bag/[id]': BagFormScreen,
    },
    { initialUrl: '/bags', ...routerProviders() },
  );
  const { router } = jest.requireActual('expo-router');
  await act(async () => router.push(path));
  await screen.findByLabelText('Title');
};

const fill = (fields: Record<string, string>) => {
  for (const [label, value] of Object.entries(fields))
    fireEvent.changeText(screen.getByLabelText(label), value);
};
const newBag = () => {
  fill({
    Title: 'Bakery surprise bag',
    'Original price': '450',
    'Sale price': '149',
    From: '18:00',
    Until: '19:30',
  });
  fireEvent.press(screen.getByRole('button', { name: 'Bakery' }));
};

beforeEach(() => {
  request.mockReset();
  // 17:00 in Kyiv.
  fakeNow('2026-09-29T14:00:00.000Z');
});
afterEach(() => jest.useRealTimers());

describe('BagFormScreen', () => {
  it('previews the discount as prices are typed', async () => {
    serve();
    await open('/bag/new');
    fill({ 'Original price': '450', 'Sale price': '149' });
    expect(screen.getByText('−67%')).toBeOnTheScreen();
    expect(screen.getByLabelText('₴149, was ₴450')).toBeOnTheScreen();
  });

  it('adds a bag: prices in kopiyky and today’s window in the shop’s timezone', async () => {
    serve();
    await open('/bag/new');
    newBag();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Add bag' }));
    });
    expect(writes()[0]).toEqual([
      '/store/bags',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          title: 'Bakery surprise bag',
          category: 'bakery',
          originalPriceMinor: 45000,
          priceMinor: 14900,
          qtyTotal: 1,
          pickupStart: '2026-09-29T15:00:00.000Z',
          pickupEnd: '2026-09-29T16:30:00.000Z',
          isActive: true,
        }),
      }),
    ]);
    expect(await screen.findByText('My bags')).toBeOnTheScreen();
  });

  it('won’t save a sale price at or above the original', async () => {
    serve();
    await open('/bag/new');
    newBag();
    fill({ 'Sale price': '450' });
    fireEvent.press(screen.getByRole('button', { name: 'Add bag' }));
    expect(screen.getByText('The sale price must be below the original price.')).toBeOnTheScreen();
    expect(writes()).toHaveLength(0);
  });

  it.each([
    ['shorter than 30 minutes', '18:00', '18:20', 'Make the window at least 30 minutes.'],
    ['already over', '12:00', '13:00', 'The window must end later today.'],
  ])('won’t save a window %s', async (_name, from, until, message) => {
    serve();
    await open('/bag/new');
    newBag();
    fill({ From: from, Until: until });
    fireEvent.press(screen.getByRole('button', { name: 'Add bag' }));
    expect(screen.getByText(message)).toBeOnTheScreen();
    expect(writes()).toHaveLength(0);
  });

  it('when editing, can’t go below what’s already reserved (stepper stops at 3)', async () => {
    serve();
    await open('/bag/b1');
    expect(screen.getByText('3 already reserved')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Fewer bags' }));
    fireEvent.press(screen.getByRole('button', { name: 'Fewer bags' }));
    expect(screen.getByRole('button', { name: 'Fewer bags' })).toBeDisabled();
  });

  it('shows the API’s below_reserved on the quantity', async () => {
    serve(() => {
      throw new ApiError(409, 'below_reserved', 'x', undefined, { reservedCount: 4 });
    });
    await open('/bag/b1');
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    });
    expect(
      await screen.findByText('4 are already reserved — you can’t offer fewer.'),
    ).toBeOnTheScreen();
  });

  it('suggests pausing when a bag with reservations can’t be deleted', async () => {
    serve(() => {
      throw new ApiError(409, 'has_reservations', 'x');
    });
    await open('/bag/b1');
    fireEvent.press(screen.getByRole('button', { name: 'Delete bag' }));
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button', { name: 'Delete bag' }).at(-1) as never);
    });
    expect(
      await screen.findByText('This bag has reservations. Pause it instead.'),
    ).toBeOnTheScreen();
  });

  it('deletes a bag nobody ordered', async () => {
    serve(() => undefined);
    await open('/bag/b1');
    fireEvent.press(screen.getByRole('button', { name: 'Delete bag' }));
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button', { name: 'Delete bag' }).at(-1) as never);
    });
    expect(writes()[0]).toEqual(['/store/bags/b1', expect.objectContaining({ method: 'DELETE' })]);
    expect(await screen.findByText('My bags')).toBeOnTheScreen();
  });
});
