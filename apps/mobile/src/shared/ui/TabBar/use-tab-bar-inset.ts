import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space, tabBar } from '../../theme';

/**
 * How far above the screen's bottom edge the island sits: into the home-indicator inset, like the
 * system's floating bars, but never lower than `tabBar.bottom` and still clear of the indicator.
 */
export const useTabBarBottom = () =>
  Math.max(useSafeAreaInsets().bottom - tabBar.homeIndicatorOverlap, tabBar.bottom);

/**
 * Space a tab screen's scrolling content (and floating toasts or buttons) needs at the bottom
 * so nothing ends up hidden under the floating tab bar.
 */
export const useTabBarInset = () => useTabBarBottom() + tabBar.height + space[3];
