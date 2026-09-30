import type { Category } from '@leftover/shared';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { RATING_DECIMALS, SINGLE_LINE } from '../../constants/ui';
import { formatDistance, formatMoney, formatWindow } from '../../lib/format';
import { Badge } from '../Badge/Badge';
import { stockTone } from '../Badge/stock-tone';
import { CategoryMedia } from '../CategoryMedia/CategoryMedia';
import { Icon } from '../icons';
import { Price } from '../Price/Price';
import { Star } from '../Stars/Star';
import { StoreLogo } from '../StoreLogo/StoreLogo';
import { STAR_SIZE, useStyles } from './styles';

type Props = {
  title: string;
  category: Category;
  storeId: string;
  storeName: string;
  /** The bag's photo and the shop's logo (20); placeholders when null. */
  photoUrl?: string | null;
  storeLogoUrl?: string | null;
  pickupStart: string;
  pickupEnd: string;
  timezone: string;
  qtyAvailable: number;
  priceMinor: number;
  originalPriceMinor: number;
  distanceKm: number;
  /** Hidden when null (no reviews yet, or reviews not built). */
  rating?: number | null;
  onPress: () => void;
  /** The save button (feature 14); omitted until favorites exist. */
  favorite?: ReactNode;
};

/** Discover card (`.bag-card`): the whole card is one tap target; the save button sits on top. */
export function BagCard(props: Props) {
  const { metaIconColor, styles } = useStyles();
  const { t } = useTranslation();
  const window = formatWindow(props.pickupStart, props.pickupEnd, props.timezone);
  const stock =
    props.qtyAvailable > 0
      ? t('ui.stock.left', { count: props.qtyAvailable })
      : t('ui.stock.soldOut');
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('ui.bagCard.label', {
          title: props.title,
          store: props.storeName,
          window,
          price: formatMoney(props.priceMinor),
        })}
        onPress={props.onPress}
        style={({ pressed }) => [styles.clip, pressed && styles.pressed]}
      >
        <CategoryMedia category={props.category} photo={props.photoUrl}>
          <View style={styles.stock}>
            <Badge tone={stockTone(props.qtyAvailable)} label={stock} />
          </View>
        </CategoryMedia>
        <View style={styles.body}>
          <View style={styles.logo}>
            <StoreLogo id={props.storeId} name={props.storeName} logo={props.storeLogoUrl} ring />
          </View>
          <Text style={styles.store} numberOfLines={SINGLE_LINE}>
            {props.storeName}
          </Text>
          <Text style={styles.title} numberOfLines={SINGLE_LINE}>
            {props.title}
          </Text>
          <View style={styles.meta}>
            <Icon name="clock" size="sm" color={metaIconColor} />
            <Text style={styles.metaText}>{window}</Text>
          </View>
          <View style={styles.foot}>
            <View style={styles.facts}>
              {props.rating != null ? (
                <>
                  <View style={styles.rating}>
                    <Star size={STAR_SIZE} on />
                    <Text style={styles.fact}>{props.rating.toFixed(RATING_DECIMALS)}</Text>
                  </View>
                  <View style={styles.sep} />
                </>
              ) : null}
              <Text style={styles.fact}>{formatDistance(props.distanceKm)}</Text>
            </View>
            <Price
              priceMinor={props.priceMinor}
              originalMinor={props.originalPriceMinor}
              soldOut={props.qtyAvailable <= 0}
              align="end"
            />
          </View>
        </View>
      </Pressable>
      {props.favorite ? <View style={styles.fav}>{props.favorite}</View> : null}
    </View>
  );
}
