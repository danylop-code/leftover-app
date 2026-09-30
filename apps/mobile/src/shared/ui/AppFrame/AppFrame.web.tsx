import type { ReactNode } from 'react';
import { View } from 'react-native';
import { styles } from './styles';

/** Web (brief 17): the app as a phone-width column centred on wide screens. */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <View style={styles.page}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}
