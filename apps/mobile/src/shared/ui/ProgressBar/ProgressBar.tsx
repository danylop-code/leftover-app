import { View } from 'react-native';
import { useStyles } from './styles';

type Props = { value: number; label: string };

/** Thin progress track (`.progress`); `value` is 0–1. */
export function ProgressBar({ value, label }: Props) {
  const { styles } = useStyles();
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);
  return (
    <View
      style={styles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}
