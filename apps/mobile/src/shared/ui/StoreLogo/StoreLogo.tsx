import { Text, View } from 'react-native';
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
      <Photo src={logo} />
    </View>
  );
}
