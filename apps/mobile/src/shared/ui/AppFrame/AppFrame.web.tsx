import { LocaleProvider } from 'expo-router';
import { type ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { useLanguage } from '../../i18n/use-language';
import { useScheme } from '../../theme';
import { useStyles } from './styles';

/** Web (brief 17): the app as a phone-width column centred on wide screens. */
export function AppFrame({ children }: { children: ReactNode }) {
  const { styles } = useStyles();
  const { language, direction } = useLanguage();
  const scheme = useScheme();

  // `dir` and `lang` on the document (brief 21): the browser's own controls, scrollbars and
  // screen readers follow the language too.
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    // Browser scrollbars, form controls and the page behind the app match the scheme (19).
    document.documentElement.style.colorScheme = scheme;
  }, [direction, language, scheme]);

  return (
    <LocaleProvider direction={direction}>
      <View style={styles.page}>
        <View style={styles.phone}>{children}</View>
      </View>
    </LocaleProvider>
  );
}
