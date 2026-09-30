import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SINGLE_LINE } from '../../constants/ui';
import { formatMoney } from '../../lib/format';
import { Icon } from '../icons';
import { StoreLogo } from '../StoreLogo/StoreLogo';
import { useStyles } from './styles';

type Props = {
  storeId: string;
  storeName: string;
  storeLogoUrl?: string | null;
  bagTitle: string;
  qty: number;
  /** Status badge, e.g. <Badge tone="ready" … />. */
  badge: ReactNode;
  /** Meta facts after the clock icon, e.g. ["Today · 18:00–19:30", "0.8 km"]. */
  meta: readonly string[];
  totalMinor?: number;
  /** Line above the total, e.g. "Pay at the store". */
  note?: string;
  /** Buttons at the bottom right (Show code, View, Leave a review…). */
  actions?: ReactNode;
};

/** Order summary card (`.order-card`) for Orders current and past. */
export function OrderCard(props: Props) {
  const { metaIconColor, styles } = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <StoreLogo id={props.storeId} name={props.storeName} logo={props.storeLogoUrl} />
        <View style={styles.topBody}>
          <Text style={styles.store} numberOfLines={SINGLE_LINE}>
            {props.storeName}
          </Text>
          <Text style={styles.item} accessibilityRole="header">
            {t('ui.orderCard.item', { title: props.bagTitle, qty: props.qty })}
          </Text>
        </View>
        {props.badge}
      </View>
      <View style={styles.meta}>
        <Icon name="clock" size="sm" color={metaIconColor} />
        {props.meta.map((m, i) => (
          <Fragment key={m}>
            {i > 0 ? <View style={styles.sep} /> : null}
            <Text style={styles.metaText}>{m}</Text>
          </Fragment>
        ))}
      </View>
      {props.totalMinor !== undefined || props.actions ? (
        <View style={styles.foot}>
          <View>
            {props.note ? <Text style={styles.note}>{props.note}</Text> : null}
            {props.totalMinor !== undefined ? (
              <Text style={styles.total}>{formatMoney(props.totalMinor)}</Text>
            ) : null}
          </View>
          {props.actions ? <View style={styles.actions}>{props.actions}</View> : null}
        </View>
      ) : null}
    </View>
  );
}
