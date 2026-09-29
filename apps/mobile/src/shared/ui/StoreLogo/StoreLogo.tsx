import { Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { logoColor } from './logo-color';
import { useStyles } from './styles';

type Props = { id: string; name: string; size?: 'md' | 'lg' | 'xl'; ring?: boolean };

const letter = { md: 'letterMd', lg: 'letterLg', xl: 'letterXl' } as const;

/** Initial-letter logo on a stable brand color (logo upload is out of scope). */
export function StoreLogo({ id, name, size = 'md', ring }: Props) {
  const { styles } = useStyles();
  const theme = useTheme();
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
      <Text style={[styles.letter, styles[letter[size]]]}>
        {name.trim().charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
