import { Pressable, Text, View } from 'react-native';
import { Icon } from '../icons';
import { actionHitSlop, useStyles } from './styles';

type Props = {
  message: string;
  tone?: 'success' | 'error';
  action?: { label: string; onPress: () => void };
};

/** Inverse snackbar (`.toast`). Placement and auto-dismiss belong to the caller. */
export function Toast({ message, tone = 'success', action }: Props) {
  const { iconColor, styles } = useStyles();
  return (
    <View style={styles.root} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon name={tone === 'error' ? 'alert' : 'check'} color={iconColor[tone]} />
      <Text style={styles.text}>{message}</Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={action.onPress}
          hitSlop={actionHitSlop}
          style={styles.action}
        >
          <Text style={styles.actionLabel}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
