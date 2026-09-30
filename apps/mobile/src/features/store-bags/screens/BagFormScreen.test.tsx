import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { ApiError, apiRequest, apiUpload, NetworkError } from '../../../shared/api/client';
import { pickImage } from '../../../shared/lib/pick-image';
import { fakeNow } from '../../../shared/testing/fake-date';
import { shopBag, shopBags } from '../../../shared/testing/fixtures';
import { pickTime } from '../../../shared/testing/pick-time';
import { routerProviders } from '../../../shared/testing/render';
import { BagFormScreen } from './BagFormScreen';

jest.mock('../../../shared/api/client', () => ({
  ...jest.requireActual('../../../shared/api/client'),
  apiRequest: jest.fn(),
  apiUpload: jest.fn(),
}));
jest.mock('../../../shared/lib/pick-image', () => ({ pickImage: jest.fn() }));
const request = apiRequest as jest.Mock;
const uploadFile = apiUpload as jest.Mock;
const pick = pickImage as jest.Mock;
const picked = { uri: 'file:///tmp/photo.jpg', name: 'photo.jpg', type: 'image/jpeg' };

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
const newBag = async () => {
  fill({ Title: 'Bakery surprise bag', 'Original price': '450', 'Sale price': '149' });
  fireEvent.press(screen.getByRole('button', { name: 'Bakery' }));
  await pickTime('From', '18:00');
  await pickTime('Until', '19:30');
};

beforeEach(() => {
  request.mockReset();
  uploadFile.mockReset();
  pick.mockReset();
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
    await newBag();
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
    await newBag();
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
    await newBag();
    await pickTime('From', from);
    await pickTime('Until', until);
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

  describe('photo (brief 20)', () => {
    const choosePhoto = async () => {
      pick.mockResolvedValue({ status: 'picked', file: picked });
      fireEvent.press(screen.getByRole('button', { name: 'Add photo' }));
      await act(async () => {
        fireEvent.press(await screen.findByRole('button', { name: 'Choose from library' }));
      });
    };

    it('uploads the picked photo after adding the bag, then closes', async () => {
      serve(() => shopBag({ id: 'b-new' }));
      uploadFile.mockImplementation(async (_path, _file, { onProgress }) => {
        onProgress(0.5);
        return { url: '/images/bags/b-new/photo/x.jpg' };
      });
      await open('/bag/new');
      await newBag();
      await choosePhoto();
      expect(pick).toHaveBeenCalledWith('library');
      expect(screen.getByRole('button', { name: 'Change photo' })).toBeOnTheScreen();
      await act(async () => {
        fireEvent.press(screen.getByRole('button', { name: 'Add bag' }));
      });
      expect(uploadFile).toHaveBeenCalledWith(
        '/store/bags/b-new/photo',
        picked,
        expect.objectContaining({ onProgress: expect.any(Function) }),
      );
      expect(await screen.findByText('My bags')).toBeOnTheScreen();
    });

    it('keeps the form open with Retry when the upload fails, and never adds the bag twice', async () => {
      serve(() => shopBag({ id: 'b-new' }));
      uploadFile.mockRejectedValueOnce(new NetworkError());
      uploadFile.mockResolvedValueOnce({ url: '/images/bags/b-new/photo/x.jpg' });
      await open('/bag/new');
      await newBag();
      await choosePhoto();
      await act(async () => {
        fireEvent.press(screen.getByRole('button', { name: 'Add bag' }));
      });
      expect(
        await screen.findByText('The photo didn’t upload. Check your connection and retry.'),
      ).toBeOnTheScreen();
      await act(async () => {
        fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
      });
      expect(uploadFile).toHaveBeenCalledTimes(2);
      expect(await screen.findByText('My bags')).toBeOnTheScreen();
      expect(writes().filter(([, o]) => o.method === 'POST')).toHaveLength(1);
    });

    it('removes an existing photo on save', async () => {
      const withPhoto = shopBag({ ...existing, photoUrl: '/images/bags/b1/photo/old.jpg' });
      request.mockImplementation(async (path: string, options: { method?: string }) => {
        if (path.endsWith('/photo')) return { url: null };
        return options.method ? withPhoto : shopBags([withPhoto]);
      });
      await open('/bag/b1');
      fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
      expect(screen.getByRole('button', { name: 'Add photo' })).toBeOnTheScreen();
      await act(async () => {
        fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
      });
      expect(request).toHaveBeenCalledWith(
        '/store/bags/b1/photo',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(await screen.findByText('My bags')).toBeOnTheScreen();
    });

    it('says how to allow photo access when it was refused', async () => {
      serve();
      await open('/bag/new');
      pick.mockResolvedValue({ status: 'denied' });
      fireEvent.press(screen.getByRole('button', { name: 'Add photo' }));
      await act(async () => {
        fireEvent.press(await screen.findByRole('button', { name: 'Take a photo' }));
      });
      expect(
        screen.getByText('Allow photo access for Leftover in Settings to add one.'),
      ).toBeOnTheScreen();
    });
  });
});
