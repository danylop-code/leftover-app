import { Pressable, Text, View } from 'react-native';
import { linkHitSlop, useStyles } from './styles';

type Props = { prompt: string; action: string; onPress: () => void };

/** "Have an account? Log in" line under the auth forms. */
export function FooterLink({ prompt, action, onPress }: Props) {
  const { styles } = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{prompt}</Text>
      <Pressable accessibilityRole="link" onPress={onPress} hitSlop={linkHitSlop}>
        <Text style={styles.link}>{action}</Text>
      </Pressable>
    </View>
  );
}
