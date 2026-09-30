import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { useSession } from '../../../shared/store/session';
import { renderWithProviders } from '../../../shared/testing/render';
import { RegisterScreen } from './RegisterScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn(), back: jest.fn() }) }));

const request = apiRequest as jest.Mock;

const user = {
  id: 'u1',
  email: 'olena@example.com',
  firstName: 'Olena',
  role: 'store',
  createdAt: '2026-09-29T10:00:00.000Z',
};

const fill = (email = 'Olena@Example.com', password = 'leftover24') => {
  fireEvent.changeText(screen.getByLabelText('First name'), 'Olena');
  fireEvent.changeText(screen.getByLabelText('Email'), email);
  fireEvent.changeText(screen.getByLabelText('Password'), password);
};

const submit = () => fireEvent.press(screen.getByRole('button', { name: 'Create account' }));

beforeEach(() => {
  request.mockReset();
  useSession.setState({ status: 'signedOut', token: null, user: null, justRegistered: false });
});

describe('RegisterScreen', () => {
  it('starts as a customer and lets you pick "I run a shop"', () => {
    renderWithProviders(<RegisterScreen />);
    expect(screen.getByRole('radio', { name: /I'm a customer/ })).toBeChecked();
    fireEvent.press(screen.getByRole('radio', { name: /I run a shop/ }));
    expect(screen.getByRole('radio', { name: /I run a shop/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /I'm a customer/ })).not.toBeChecked();
  });

  it('blocks submit with inline errors and makes no request', () => {
    renderWithProviders(<RegisterScreen />);
    fill('not-an-email', 'short');
    submit();
    expect(screen.getByText('Enter a valid email address.')).toBeOnTheScreen();
    expect(screen.getByText('Use at least 8 characters.')).toBeOnTheScreen();
    expect(request).not.toHaveBeenCalled();
  });

  it('sends the chosen role and a normalised email, then signs in as just registered', async () => {
    request.mockResolvedValue({ token: 'tok', user });
    renderWithProviders(<RegisterScreen />);
    fireEvent.press(screen.getByRole('radio', { name: /I run a shop/ }));
    fill();
    submit();
    await waitFor(() => expect(useSession.getState().status).toBe('signedIn'));
    expect(request).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: {
          role: 'store',
          firstName: 'Olena',
          email: 'olena@example.com',
          password: 'leftover24',
        },
      }),
    );
    expect(useSession.getState()).toMatchObject({ token: 'tok', justRegistered: true });
  });

  it('disables submit while the request is pending', async () => {
    request.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<RegisterScreen />);
    fill();
    submit();
    const button = await screen.findByRole('button', { name: 'Create account' });
    await waitFor(() => expect(button).toBeBusy());
    fireEvent.press(button);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('shows email_taken on the email field', async () => {
    request.mockRejectedValue(new ApiError(409, 'email_taken', 'taken'));
    renderWithProviders(<RegisterScreen />);
    fill();
    submit();
    expect(await screen.findByText('An account with this email already exists.')).toBeOnTheScreen();
    expect(useSession.getState().status).toBe('signedOut');
  });
});
