import { Text, View } from 'react-native';
import { useStyles } from './styles';

export type BadgeTone = keyof ReturnType<typeof useStyles>['tones'];

type Props = { label: string; tone: BadgeTone; onSunken?: boolean };

/** Status/stock pill. Stock tones (stock, low, out) carry a dot. */
export function Badge({ label, tone, onSunken }: Props) {
  const { styles, tones } = useStyles();
  const { bg, fg, dot } = tones[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg }, onSunken && styles.onSunken]}>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}
