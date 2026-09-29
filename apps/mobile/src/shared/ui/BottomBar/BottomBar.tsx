import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { barPadding, styles } from './styles';

/** Sticky footer panel (`.bottom-bar`): totals and the main action. */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bar, barPadding(insets.bottom)]}>{children}</View>;
}
