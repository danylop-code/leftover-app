import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { ApiError, apiRequest } from '../../../shared/api/client';
import { orderDetail } from '../../../shared/testing/fixtures';
import { routerProviders } from '../../../shared/testing/render';
import { ReviewScreen } from './ReviewScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
}));
const request = apiRequest as jest.Mock;

const collected = orderDetail({
  status: 'collected',
  displayStatus: 'collected',
  collectedAt: '2026-09-29T15:12:00.000Z',
});

const serve = (review: () => unknown = () => undefined) =>
  request.mockImplementation(async (path: string) =>
    path.endsWith('/review') ? review() : collected,
  );
const reviewCalls = () => request.mock.calls.filter(([path]) => path.endsWith('/review'));

const open = async (query = '') => {
  renderRouter(
    { orders: () => <Text>Orders screen</Text>, 'review/[orderId]': ReviewScreen },
    { initialUrl: '/orders', ...routerProviders() },
  );
  const { router } = jest.requireActual('expo-router');
  await act(async () => router.push(`/review/o1${query}`));
  await screen.findByText('Crumb & Co. Bakery');
};

const submit = () => screen.getByRole('button', { name: 'Submit review' });

beforeEach(() => request.mockReset());

describe('ReviewScreen', () => {
  it('needs an overall rating before it can be sent', async () => {
    serve();
    await open();
    expect(submit()).toBeDisabled();
    fireEvent.press(screen.getAllByRole('button', { name: '4 stars' })[0] as never);
    expect(screen.getByText('Really good')).toBeOnTheScreen();
    expect(submit()).toBeEnabled();
  });

  it('opens with the stars tapped on Collected already chosen', async () => {
    serve();
    await open('?overall=5');
    expect(screen.getByText('Amazing')).toBeOnTheScreen();
    expect(submit()).toBeEnabled();
  });

  it('sends overall, the aspects that were rated and the text, then closes', async () => {
    serve();
    await open('?overall=4');
    // The aspect rows follow the overall stars: Quality is the second "3 stars" button.
    fireEvent.press(screen.getAllByRole('button', { name: '3 stars' })[1] as never);
    fireEvent.changeText(screen.getByLabelText('Anything to add?'), 'Lovely focaccia.');
    await act(async () => {
      fireEvent.press(submit());
    });
    expect(reviewCalls()[0]?.[1]).toMatchObject({
      method: 'POST',
      body: { overall: 4, quality: 3, text: 'Lovely focaccia.' },
    });
    expect(await screen.findByText('Orders screen')).toBeOnTheScreen();
  });

  it('turns the counter to an error past 500 characters and blocks sending', async () => {
    serve();
    await open('?overall=4');
    fireEvent.changeText(screen.getByLabelText('Anything to add?'), 'x'.repeat(501));
    expect(screen.getByText('501/500')).toBeOnTheScreen();
    expect(submit()).toBeDisabled();
  });

  it('says so when the bag was already reviewed', async () => {
    serve(() => {
      throw new ApiError(409, 'already_reviewed', 'x');
    });
    await open('?overall=4');
    await act(async () => {
      fireEvent.press(submit());
    });
    expect(await screen.findByText('You’ve already reviewed this bag.')).toBeOnTheScreen();
  });
});
