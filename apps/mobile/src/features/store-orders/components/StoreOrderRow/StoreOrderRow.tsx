import type { StoreOrder } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { formatMoney, formatTime, formatTimeRange } from '../../../../shared/lib/format';
import { Badge } from '../../../../shared/ui';
import { useStyles } from './styles';

type Props = { order: StoreOrder; timezone: string; last?: boolean };

/** A line in "To collect": who, what, when, status and amount. */
export function StoreOrderRow({ order, timezone, last }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const done = order.displayStatus === 'collected';
  const badge = done ? (
    <Badge
      tone="collected"
      label={t('storeOrders.collectedAt', {
        time: order.collectedAt ? formatTime(order.collectedAt, timezone) : '',
      })}
    />
  ) : (
    <Badge tone={order.displayStatus} label={t(`ui.status.${order.displayStatus}`)} />
  );
  return (
    <View style={[styles.row, last && styles.last]} accessible>
      <View style={styles.body}>
        <Text style={[styles.name, done && styles.muted]}>{order.customerName}</Text>
        <Text style={styles.caption}>
          {done
            ? t('storeOrders.itemCollected', { qty: order.qty, title: order.bagTitle })
            : t('storeOrders.item', {
                qty: order.qty,
                title: order.bagTitle,
                window: formatTimeRange(order.pickupStart, order.pickupEnd, timezone),
              })}
        </Text>
      </View>
      <View style={styles.side}>
        {badge}
        <Text style={[styles.amount, done && styles.muted]}>{formatMoney(order.totalMinor)}</Text>
      </View>
    </View>
  );
}
