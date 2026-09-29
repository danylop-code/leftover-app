import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { apiRequest } from '../../../shared/api/client';
import { useLocation } from '../../../shared/store/location';
import { usePreferences } from '../../../shared/store/preferences';
import { useSession } from '../../../shared/store/session';
import { customer, shopOwnerUser } from '../../../shared/testing/fixtures';
import { routerProviders } from '../../../shared/testing/render';
import { ProfileScreen } from './ProfileScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const serve = () =>
  request.mockImplementation(async (path: string, options: { method?: string; body?: unknown }) => {
    if (path === '/me/stats') return { bagsRescued: 4, savedMinor: 71200 };
    if (path === '/me' && options.method === 'PATCH')
      return { ...customer, ...(options.body as object) };
    return undefined;
  });

const open = async () => {
  renderRouter(
    {
      profile: ProfileScreen,
      location: () => <Text>Location screen</Text>,
      report: () => <Text>Report screen</Text>,
    },
    { initialUrl: '/profile', ...routerProviders() },
  );
  await act(async () => {});
};

beforeEach(() => {
  request.mockReset();
  serve();
  useLocation.setState({ selected: { label: 'Lviv', lat: 49.84, lng: 24.03 }, radiusKm: 5 });
});

describe('ProfileScreen', () => {
  it('shows a customer who they are, their impact and pickup area', async () => {
    useSession.setState({ status: 'signedIn', token: 'tok', user: customer });
    await open();
    expect(screen.getByText('Olena')).toBeOnTheScreen();
    expect(screen.getByText('olena@example.com')).toBeOnTheScreen();
    expect(await screen.findByLabelText('4 bags rescued')).toBeOnTheScreen();
    expect(screen.getByLabelText('₴712 saved so far')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Pickup area, Lviv · 5 km' })).toBeOnTheScreen();
    expect(screen.queryByText('Notifications')).toBeNull();
    expect(screen.getByText('English')).toBeOnTheScreen();
  });

  it('switches to Arabic from Language and back to English, remembering the choice', async () => {
    useSession.setState({ status: 'signedIn', token: 'tok', user: customer });
    await open();
    fireEvent.press(screen.getByRole('button', { name: 'Language, English' }));
    fireEvent.press(await screen.findByRole('radio', { name: 'العربية' }));
    expect(await screen.findByText('الحساب')).toBeOnTheScreen();
    expect(usePreferences.getState().language).toBe('ar');
    fireEvent.press(screen.getByRole('button', { name: 'اللغة، العربية' }));
    fireEvent.press(await screen.findByRole('radio', { name: 'English' }));
    expect(await screen.findByText('Profile')).toBeOnTheScreen();
    expect(usePreferences.getState().language).toBe('en');
  });

  it('Pickup area opens Location, and the row follows the new choice', async () => {
    useSession.setState({ status: 'signedIn', token: 'tok', user: customer });
    await open();
    fireEvent.press(screen.getByRole('button', { name: /^Pickup area/ }));
    expect(await screen.findByText('Location screen')).toBeOnTheScreen();
    act(() => {
      useLocation.setState({
        selected: { label: 'Rynok Square 1', lat: 49.84, lng: 24.03 },
        radiusKm: 12,
      });
    });
    const { router } = jest.requireActual('expo-router');
    await act(async () => router.back());
    expect(
      screen.getByRole('button', { name: 'Pickup area, Rynok Square 1 · 12 km' }),
    ).toBeOnTheScreen();
  });

  it('shows a shop owner no stats or pickup area, but Log out', async () => {
    useSession.setState({ status: 'signedIn', token: 'tok', user: shopOwnerUser });
    await open();
    expect(screen.getByText('Taras')).toBeOnTheScreen();
    expect(screen.queryByText(/bags? rescued/)).toBeNull();
    expect(screen.queryByText('Pickup area')).toBeNull();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeOnTheScreen();
    expect(request).not.toHaveBeenCalledWith('/me/stats', expect.anything());
  });

  it('logs out after confirming, clearing the session', async () => {
    useSession.setState({ status: 'signedIn', token: 'tok', user: customer });
    await open();
    fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
    expect(screen.getByText('Log out?')).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button', { name: 'Log out' }).at(-1) as never);
    });
    await waitFor(() => expect(useSession.getState().status).toBe('signedOut'));
    expect(request).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('renames: an empty name is refused inline; a real one is saved to the session', async () => {
    useSession.setState({ status: 'signedIn', token: 'tok', user: customer });
    await open();
    fireEvent.press(screen.getByRole('button', { name: 'Edit profile' }));
    fireEvent.changeText(screen.getByLabelText('First name'), '   ');
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Enter your first name (up to 40 characters).')).toBeOnTheScreen();
    expect(request).not.toHaveBeenCalledWith('/me', expect.objectContaining({ method: 'PATCH' }));

    fireEvent.changeText(screen.getByLabelText('First name'), 'Olha');
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    });
    expect(request).toHaveBeenCalledWith(
      '/me',
      expect.objectContaining({ method: 'PATCH', body: { firstName: 'Olha' } }),
    );
    await waitFor(() => expect(useSession.getState().user?.firstName).toBe('Olha'));
  });

  it('opens Report a problem, for both roles', async () => {
    useSession.setState({ status: 'signedIn', token: 'tok', user: shopOwnerUser });
    await open();
    fireEvent.press(screen.getByRole('button', { name: 'Report a problem' }));
    expect(await screen.findByText('Report screen')).toBeOnTheScreen();
  });
});
