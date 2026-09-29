import { Text, View } from 'react-native';
import { styles } from './styles';

type Props = { title: string; kicker?: string };

/** Large page title (`.hdr-lg`): kicker above a display title. */
export function HeaderLarge({ title, kicker }: Props) {
  return (
    <View style={styles.large}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.largeTitle} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}
