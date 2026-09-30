import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { apiRequest, NetworkError } from '../../../shared/api/client';
import { shopBag, shopBags } from '../../../shared/testing/fixtures';
import { routerProviders } from '../../../shared/testing/render';
import { tones } from '../../../shared/ui/Badge/styles';
import { StoreBagsScreen } from './StoreBagsScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const live = shopBag({ id: 'b1', title: 'Bakery surprise bag', qtyTotal: 5, qtyAvailable: 3 });
const low = shopBag({ id: 'b2', title: 'Sweet box', qtyTotal: 4, qtyAvailable: 1 });
const paused = shopBag({ id: 'b3', title: 'Sandwich bag', isActive: false, qtyAvailable: 4 });
const soldOut = shopBag({ id: 'b4', title: 'Bread-only bag', qtyTotal: 4, qtyAvailable: 0 });

/** A server that remembers pauses (so refetches agree with the optimistic UI). */
const serve = (bags = [live, low, paused, soldOut], failPatch = false) => {
  let state = bags;
  request.mockImplementation(
    async (path: string, options: { method?: string; body?: { isActive: boolean } }) => {
      if (options.method === 'PATCH') {
        if (failPatch) throw new NetworkError();
        const id = path.split('/').pop();
        state = state.map((b) => (b.id === id ? { ...b, ...options.body } : b));
        return state.find((b) => b.id === id);
      }
      return shopBags(state);
    },
  );
};

const open = async () => {
  renderRouter(
    {
      bags: StoreBagsScreen,
      'bag/new': () => <Text>New bag form</Text>,
      'bag/[id]': () => <Text>Edit bag form</Text>,
    },
    { initialUrl: '/bags', ...routerProviders() },
  );
  await act(async () => {});
};

const liveSwitch = (title: string) =>
  screen.getByRole('switch', { name: new RegExp(`^${title} is (live|paused)$`) });

beforeEach(() => request.mockReset());

describe('StoreBagsScreen', () => {
  it('shows the shop, the stats and each bag’s state', async () => {
    serve();
    await open();
    expect(await screen.findByText('Crumb & Co. Bakery')).toBeOnTheScreen();
    expect(screen.getByLabelText('2 bags live now')).toBeOnTheScreen();
    expect(screen.getByLabelText('5 reserved today')).toBeOnTheScreen();
    expect(screen.getByText('3 of 5 left')).toBeOnTheScreen();
    expect(screen.getByText('1 of 4 left')).toHaveStyle({ color: tones.low.fg });
    expect(screen.getByText('Paused · 4')).toBeOnTheScreen();
    expect(screen.getByText('Sold out')).toBeOnTheScreen();
    expect(liveSwitch('Sandwich bag')).not.toBeChecked();
    expect(liveSwitch('Bakery surprise bag')).toBeChecked();
  });

  it('pauses from the switch at once, with an Undo that resumes it', async () => {
    serve();
    await open();
    await screen.findByText('3 of 5 left');
    await act(async () => {
      fireEvent.press(liveSwitch('Bakery surprise bag'));
    });
    await waitFor(() => expect(liveSwitch('Bakery surprise bag')).not.toBeChecked());
    expect(screen.getByText('Bakery surprise bag paused')).toBeOnTheScreen();
    expect(request).toHaveBeenCalledWith(
      '/store/bags/b1',
      expect.objectContaining({ method: 'PATCH', body: { isActive: false } }),
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    });
    await waitFor(() => expect(liveSwitch('Bakery surprise bag')).toBeChecked());
    expect(request).toHaveBeenCalledWith(
      '/store/bags/b1',
      expect.objectContaining({ method: 'PATCH', body: { isActive: true } }),
    );
  });

  it('rolls the switch back and says so when pausing fails', async () => {
    serve([live], true);
    await open();
    await screen.findByText('3 of 5 left');
    await act(async () => {
      fireEvent.press(liveSwitch('Bakery surprise bag'));
    });
    expect(
      await screen.findByText('Couldn’t update Bakery surprise bag. Try again.'),
    ).toBeOnTheScreen();
    expect(liveSwitch('Bakery surprise bag')).toBeChecked();
  });

  it('opens a bag to edit, and Add bag for a new one', async () => {
    serve();
    await open();
    fireEvent.press(await screen.findByRole('button', { name: 'Sweet box' }));
    expect(await screen.findByText('Edit bag form')).toBeOnTheScreen();
    expect(screen).toHavePathname('/bag/b2');
  });

  it('with no bags yet, offers to add the first one', async () => {
    serve([]);
    await open();
    expect(await screen.findByText('No bags yet')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Add a bag' }));
    expect(await screen.findByText('New bag form')).toBeOnTheScreen();
  });
});
