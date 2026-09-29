import { Text, View } from 'react-native';
import { styles, tones } from './styles';

type Props = { value: string; label: string; tone?: keyof typeof tones };

/** A number over a caption on a tinted tile ("2 bags live now", "₴3,480 saved so far"). */
export function StatTile({ value, label, tone = 'primary' }: Props) {
  const t = tones[tone];
  return (
    <View
      style={[styles.tile, { backgroundColor: t.bg }]}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <Text style={[styles.value, { color: t.fg }]}>{value}</Text>
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}
