import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { PREFERENCES_STORAGE_KEY, usePreferences } from '../store/preferences';
import { useScheme, useTheme } from './runtime';

const phone = jest.spyOn(ReactNative, 'useColorScheme');
afterEach(() => phone.mockReset());

describe('color scheme (brief 19)', () => {
  it('follows the phone on System, including a change while the app is open', () => {
    phone.mockReturnValue('dark');
    const { result, rerender } = renderHook(() => useTheme());
    expect(result.current.scheme).toBe('dark');
    expect(result.current.color.background).toBe('#121814');
    phone.mockReturnValue('light');
    rerender({});
    expect(result.current.scheme).toBe('light');
    expect(result.current.color.background).toBe('#FAF4E8');
  });

  it('lets Light or Dark from Profile win over the phone', async () => {
    phone.mockReturnValue('dark');
    const { result } = renderHook(() => useScheme());
    await act(async () => usePreferences.getState().setAppearance('light'));
    expect(result.current).toBe('light');
    phone.mockReturnValue('light');
    await act(async () => usePreferences.getState().setAppearance('dark'));
    expect(result.current).toBe('dark');
  });

  it('keeps the choice across a restart', async () => {
    usePreferences.getState().setAppearance('dark');
    const saved = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    usePreferences.setState({ appearance: 'system' });
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, saved ?? '');
    await usePreferences.persist.rehydrate();
    expect(usePreferences.getState().appearance).toBe('dark');
  });

  it('defaults an older saved entry (language only) to System', async () => {
    await AsyncStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ state: { language: 'ar' }, version: 1 }),
    );
    await usePreferences.persist.rehydrate();
    expect(usePreferences.getState()).toMatchObject({ language: 'ar', appearance: 'system' });
  });
});
