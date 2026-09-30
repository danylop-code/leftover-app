import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { RATING_DECIMALS, RATING_MAX } from '../../constants/ui';
import { styles } from './styles';

type Props = { name: string; value: number };

/** Per-aspect rating (`.rbar`): name, bar filled to value / 5, value. */
export function RatingBar({ name, value }: Props) {
  const { t } = useTranslation();
  const shown = value.toFixed(RATING_DECIMALS);
  const width = `${(Math.min(value, RATING_MAX) / RATING_MAX) * 100}%` as const;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={t('ui.ratingBar', { name, value: shown })}
    >
      <Text style={styles.name}>{name}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width }]} />
      </View>
      <Text style={styles.value}>{shown}</Text>
    </View>
  );
}
