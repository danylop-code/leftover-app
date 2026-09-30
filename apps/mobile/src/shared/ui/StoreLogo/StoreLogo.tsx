import { Text, View } from 'react-native';
import { isArabicScript } from '../../i18n/bidi';
import { useTheme } from '../../theme';
import { Photo } from '../Photo/Photo';
import { logoColor } from './logo-color';
import { useStyles } from './styles';

type Props = {
  id: string;
  name: string;
  size?: 'md' | 'lg' | 'xl';
  ring?: boolean;
  /** The uploaded logo (20); the initial stays as its placeholder and fallback. */
  logo?: string | null;
};

const letter = { md: 'letterMd', lg: 'letterLg', xl: 'letterXl' } as const;

/** The shop's logo, or its initial on a stable brand color until one is uploaded. */
export function StoreLogo({ id, name, size = 'md', ring, logo }: Props) {
  const { styles } = useStyles();
  const theme = useTheme();
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.root,
        styles[size],
        ring && styles.ring,
        { backgroundColor: logoColor(id, theme.logoPalette) },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* The initial's own script picks the face: a Latin "Q" in the Arabic UI keeps Fraunces
          (IBM Plex Sans Arabic's tall metrics push Latin capitals above centre). */}
      <Text
        style={[
          styles.letter,
          isArabicScript(initial) ? styles.arabic : styles.latin,
          styles[letter[size]],
        ]}
      >
        {initial}
      </Text>
      <Photo src={logo} />
    </View>
  );
}
