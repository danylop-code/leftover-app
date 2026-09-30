import { Text, View } from 'react-native';
import { logoColor } from './logo-color';
import { styles } from './styles';

type Props = { id: string; name: string; size?: 'md' | 'lg'; ring?: boolean };

/** Initial-letter logo on a stable brand color (logo upload is out of scope). */
export function StoreLogo({ id, name, size = 'md', ring }: Props) {
  return (
    <View
      style={[styles.root, styles[size], ring && styles.ring, { backgroundColor: logoColor(id) }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.letter, size === 'lg' ? styles.letterLg : styles.letterMd]}>
        {name.trim().charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
