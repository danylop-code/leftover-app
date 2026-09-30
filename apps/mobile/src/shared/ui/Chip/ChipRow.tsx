import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { styles } from './styles';

type Props = { children: ReactNode; accessibilityLabel?: string };

/** Horizontally scrolling row of chips, inset by the screen margin. */
export function ChipRow({ children, accessibilityLabel }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
    >
      {children}
    </ScrollView>
  );
}
