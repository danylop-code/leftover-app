import { LocaleProvider } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { useStyles } from './styles';

/**
 * Native: the app fills the screen. The web sibling centres a phone-width column. Both set the
 * layout direction for the language: the root view's `direction` mirrors the layout, and
 * expo-router's `LocaleProvider` mirrors headers, transitions and the back gesture. This works
 * without `I18nManager.forceRTL` and its app reload, which Expo Go doesn't support.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const { styles } = useStyles();
  const { direction } = useTheme();
  return (
    <LocaleProvider direction={direction}>
      <View style={styles.root} testID="app-frame">
        {children}
      </View>
    </LocaleProvider>
  );
}
