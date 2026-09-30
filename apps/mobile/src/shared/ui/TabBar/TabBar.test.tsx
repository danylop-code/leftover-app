import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { testSafeArea } from '../../testing/render';
import { tabBar } from '../../theme';
import { TabBar, type TabItem } from './TabBar';

const items = (onPress = jest.fn()): TabItem[] => [
  { key: 'd', label: 'Discover', icon: 'discover', active: true, onPress },
  { key: 's', label: 'Saved', icon: 'heart', active: false, onPress },
  { key: 'o', label: 'Orders', icon: 'orders', active: false, onPress },
  { key: 'p', label: 'Profile', icon: 'profile', active: false, onPress },
];

const renderBar = (list: TabItem[]) =>
  render(
    <SafeAreaProvider initialMetrics={testSafeArea}>
      <TabBar items={list} />
    </SafeAreaProvider>,
  );

describe('TabBar', () => {
  it('shows the tabs in order, the active one selected, and navigates on press', () => {
    const onPress = jest.fn();
    renderBar(items(onPress));
    expect(screen.getAllByRole('tab').map((t) => t.props.accessibilityLabel)).toEqual([
      'Discover',
      'Saved',
      'Orders',
      'Profile',
    ]);
    expect(screen.getByRole('tab', { name: 'Discover' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Orders' })).not.toBeSelected();
    fireEvent.press(screen.getByRole('tab', { name: 'Orders' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('floats low, reaching into the home-indicator inset (brief 22)', () => {
    renderBar(items());
    // max(safe-area bottom − 18, 16): 16 on the test iPhone (34 pt inset), clear of the indicator.
    expect(screen.getByTestId('tab-bar')).toHaveStyle({
      position: 'absolute',
      bottom: testSafeArea.insets.bottom - tabBar.homeIndicatorOverlap,
    });
  });

  it('hides while the Android keyboard is open', () => {
    const os = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    const listeners: Record<string, () => void> = {};
    const spy = jest.spyOn(Keyboard, 'addListener').mockImplementation((event, cb) => {
      listeners[event] = cb as () => void;
      return { remove: jest.fn() } as never;
    });
    renderBar(items());
    act(() => listeners.keyboardDidShow?.());
    expect(screen.queryByRole('tab', { name: 'Discover' })).toBeNull();
    act(() => listeners.keyboardDidHide?.());
    expect(screen.getByRole('tab', { name: 'Discover' })).toBeOnTheScreen();
    spy.mockRestore();
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  });
});
