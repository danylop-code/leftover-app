import { act, fireEvent, screen } from '@testing-library/react-native';

/** Opens the TimeField labelled `label`, spins the (iOS) picker to `hhmm` and taps Done. */
export const pickTime = async (label: string, hhmm: string) => {
  fireEvent.press(screen.getByRole('button', { name: new RegExp(`^${label},`) }));
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const date = new Date();
  date.setHours(h, m, 0, 0);
  await act(async () => {
    fireEvent(screen.getByTestId('time-picker'), 'change', { type: 'set' }, date);
  });
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Done' }));
  });
};
