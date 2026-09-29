import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space, tabBar } from '../../theme';

/** How far above the screen's bottom edge the island sits (clear of the home indicator). */
export const useTabBarBottom = () => Math.max(useSafeAreaInsets().bottom, tabBar.bottom);

/**
 * Space a tab screen's scrolling content (and floating toasts or buttons) needs at the bottom
 * so nothing ends up hidden under the floating tab bar.
 */
export const useTabBarInset = () => useTabBarBottom() + tabBar.height + space[3];
