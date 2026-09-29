import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { pickTime } from '../../testing/pick-time';
import { testSafeArea } from '../../testing/render';
import { Field } from '../Field/Field';
import { TimeField } from './TimeField';

function Harness({ initial = '' }: { initial?: string }) {
  const [time, setTime] = useState(initial);
  return (
    <SafeAreaProvider initialMetrics={testSafeArea}>
      <Field label="Opens at">
        <TimeField value={time} onChange={setTime} />
      </Field>
    </SafeAreaProvider>
  );
}

describe('TimeField', () => {
  it('asks to choose a time until one is picked', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Opens at, not set' })).toBeOnTheScreen();
    expect(screen.getByText('Choose a time')).toBeOnTheScreen();
  });

  it('on iOS: picks in a sheet with a spinner, applied on Done', async () => {
    render(<Harness initial="08:00" />);
    await pickTime('Opens at', '09:30');
    expect(screen.getByRole('button', { name: 'Opens at, 09:30' })).toBeOnTheScreen();
  });

  it('on Android: opens the system dialog and applies a set time, ignoring a dismissal', async () => {
    const os = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    const open = DateTimePickerAndroid.open as jest.Mock;
    open.mockClear();
    render(<Harness initial="08:00" />);
    fireEvent.press(screen.getByRole('button', { name: 'Opens at, 08:00' }));
    const [options] = open.mock.calls[0] ?? [];
    const { onChange, mode, is24Hour } = options;
    expect({ mode, is24Hour }).toEqual({ mode: 'time', is24Hour: true });

    await act(async () => onChange({ type: 'dismissed' }, undefined));
    expect(screen.getByRole('button', { name: 'Opens at, 08:00' })).toBeOnTheScreen();

    const later = new Date();
    later.setHours(20, 15, 0, 0);
    await act(async () => onChange({ type: 'set' }, later));
    expect(screen.getByRole('button', { name: 'Opens at, 20:15' })).toBeOnTheScreen();
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  });
});
