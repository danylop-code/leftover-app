import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ApiError, apiRequest, NetworkError } from '../../../shared/api/client';
import { useSession } from '../../../shared/store/session';
import { renderWithProviders } from '../../../shared/testing/render';
import { LoginScreen } from './LoginScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn(), back: jest.fn() }) }));

const request = apiRequest as jest.Mock;

const logIn = (email = 'olena@example.com', password = 'leftover24') => {
  fireEvent.changeText(screen.getByLabelText('Email'), email);
  fireEvent.changeText(screen.getByLabelText('Password'), password);
  fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
};

beforeEach(() => {
  request.mockReset();
  useSession.setState({ status: 'signedOut', token: null, user: null, justRegistered: false });
});

describe('LoginScreen', () => {
  it('shows an error banner on 401 invalid_credentials', async () => {
    request.mockRejectedValue(new ApiError(401, 'invalid_credentials', 'nope'));
    renderWithProviders(<LoginScreen />);
    logIn();
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('shows the offline message on a network failure', async () => {
    request.mockRejectedValue(new NetworkError());
    renderWithProviders(<LoginScreen />);
    logIn();
    expect(
      await screen.findByText("Couldn't connect. Check your connection and try again."),
    ).toBeOnTheScreen();
  });

  it('requires both fields before calling the API', () => {
    renderWithProviders(<LoginScreen />);
    logIn('', '');
    expect(screen.getByText('Enter a valid email address.')).toBeOnTheScreen();
    expect(screen.getByText('Enter your password.')).toBeOnTheScreen();
    expect(request).not.toHaveBeenCalled();
  });

  it('signs in on success (not flagged as just registered)', async () => {
    request.mockResolvedValue({
      token: 'tok',
      user: {
        id: 'u1',
        email: 'olena@example.com',
        firstName: 'Olena',
        role: 'customer',
        createdAt: '2026-09-29T10:00:00.000Z',
        storeId: null,
      },
    });
    renderWithProviders(<LoginScreen />);
    logIn();
    await waitFor(() => expect(useSession.getState().status).toBe('signedIn'));
    expect(useSession.getState().justRegistered).toBe(false);
  });

  it('toggles password visibility', () => {
    renderWithProviders(<LoginScreen />);
    expect(screen.getByLabelText('Password')).toHaveProp('secureTextEntry', true);
    fireEvent.press(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password')).toHaveProp('secureTextEntry', false);
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeOnTheScreen();
  });
});
