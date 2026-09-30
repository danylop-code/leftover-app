import type { Category } from '@leftover/shared';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SINGLE_LINE } from '../../constants/ui';
import { CategoryMedia } from '../CategoryMedia/CategoryMedia';
import { Icon } from '../icons';
import { Price } from '../Price/Price';
import { useStyles } from './styles';

type Props = {
  title: string;
  category: Category;
  /** The bag's photo (20); the category placeholder when null. */
  photoUrl?: string | null;
  /** Usually the pickup window, e.g. "Today · 18:00–19:30". */
  meta: string;
  priceMinor: number;
  originalPriceMinor: number;
  /** Stock or state badge ("3 left", "Paused", "Sold out · Back tomorrow"). */
  badge?: ReactNode;
  /** Trailing control beside the title (e.g. the live switch on My bags). */
  accessory?: ReactNode;
  soldOut?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Compact bag row (`.bag-row`, media 88). Sold-out rows are dimmed and not pressable. */
export function BagRow(props: Props) {
  const { metaIconColor, styles } = useStyles();
  const inner = (
    <>
      <CategoryMedia category={props.category} variant="row" photo={props.photoUrl} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={SINGLE_LINE}>
            {props.title}
          </Text>
          {props.accessory}
        </View>
        <View style={styles.meta}>
          <Icon name="clock" size="sm" color={metaIconColor} />
          <Text style={styles.metaText}>{props.meta}</Text>
        </View>
        <View style={styles.foot}>
          {props.badge ?? <View />}
          <Price
            priceMinor={props.priceMinor}
            originalMinor={props.originalPriceMinor}
            soldOut={props.soldOut}
            align="end"
          />
        </View>
      </View>
    </>
  );
  if (!props.onPress || props.soldOut) {
    return (
      <View
        style={[styles.row, props.soldOut && styles.dimmed]}
        accessible={Boolean(props.accessibilityLabel)}
        accessibilityLabel={props.accessibilityLabel}
        accessibilityState={{ disabled: Boolean(props.soldOut) }}
      >
        {inner}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
      onPress={props.onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {inner}
    </Pressable>
  );
}
