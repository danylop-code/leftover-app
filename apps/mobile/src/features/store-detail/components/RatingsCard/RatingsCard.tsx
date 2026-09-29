import { REVIEW_ASPECTS, type StoreRatingDetail } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { RATING_DECIMALS } from '../../../../shared/constants/ui';
import { RatingBar, Stars } from '../../../../shared/ui';
import { styles } from './styles';

type Props = { rating: StoreRatingDetail };

/** The Ratings card: average, stars and count, then a bar per aspect people rated. */
export function RatingsCard({ rating }: Props) {
  const { t } = useTranslation();
  const rated = REVIEW_ASPECTS.filter((a) => rating.aspects[a] !== null);
  return (
    <View style={styles.card}>
      <View style={styles.summary}>
        <Text style={styles.average}>{rating.average.toFixed(RATING_DECIMALS)}</Text>
        <View style={styles.side}>
          <Stars value={rating.average} />
          <Text style={styles.count}>{t('storeDetail.ratingCount', { count: rating.count })}</Text>
        </View>
      </View>
      {rated.length > 0 ? (
        <View style={styles.bars}>
          {rated.map((aspect) => (
            <RatingBar
              key={aspect}
              name={t(`storeDetail.aspects.${aspect}`)}
              value={rating.aspects[aspect] ?? 0}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
