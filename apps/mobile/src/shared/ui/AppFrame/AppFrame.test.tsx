import { act, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { usePreferences } from '../../store/preferences';
import { AppFrame } from './AppFrame';

const directionOfRoot = () =>
  StyleSheet.flatten(screen.getByTestId('app-frame').props.style).direction;

describe('AppFrame', () => {
  it('lays the app out left-to-right in English and right-to-left in Arabic', async () => {
    render(
      <AppFrame>
        <Text testID="content">x</Text>
      </AppFrame>,
    );
    expect(directionOfRoot()).toBe('ltr');
    await act(async () => usePreferences.getState().setLanguage('ar'));
    expect(directionOfRoot()).toBe('rtl');
    await act(async () => usePreferences.getState().setLanguage('en'));
    expect(directionOfRoot()).toBe('ltr');
  });
});
