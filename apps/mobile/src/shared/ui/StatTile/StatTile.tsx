import { Text, View } from 'react-native';
import { MIN_FIT_SCALE, SINGLE_LINE } from '../../constants/ui';
import { useStyles } from './styles';

type Props = { value: string; label: string; tone?: keyof ReturnType<typeof useStyles>['tones'] };

/** A number over a caption on a tinted tile ("2 bags live now", "OMR 12.500 saved so far"). */
export function StatTile({ value, label, tone = 'primary' }: Props) {
  const { styles, tones } = useStyles();
  const t = tones[tone];
  return (
    <View
      style={[styles.tile, { backgroundColor: t.bg }]}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <Text
        style={[styles.value, { color: t.fg }]}
        numberOfLines={SINGLE_LINE}
        adjustsFontSizeToFit
        minimumFontScale={MIN_FIT_SCALE}
      >
        {value}
      </Text>
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}
