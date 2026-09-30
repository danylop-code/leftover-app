import { type StyleProp, View, type ViewStyle } from 'react-native';
import { styles } from './styles';

type Props = { style?: StyleProp<ViewStyle> };

/** Placeholder block (`.sk`); size it from the screen's styles.ts to mirror the real layout. */
export function Skeleton({ style }: Props) {
  return (
    <View
      style={[styles.block, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
