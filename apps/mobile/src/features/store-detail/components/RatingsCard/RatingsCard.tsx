import type { StoreRating } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { RATING_DECIMALS } from '../../../../shared/constants/ui';
import { Stars } from '../../../../shared/ui';
import { styles } from './styles';

type Props = { rating: StoreRating };

/** The Ratings card's summary: average, stars and count. 13 adds the per-aspect bars. */
export function RatingsCard({ rating }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <Text style={styles.average}>{rating.average.toFixed(RATING_DECIMALS)}</Text>
      <View style={styles.side}>
        <Stars value={rating.average} />
        <Text style={styles.count}>{t('storeDetail.ratingCount', { count: rating.count })}</Text>
      </View>
    </View>
  );
}
