import { haversineKm, type LatLng, type OrderDetail } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { formatDay, formatDistance, formatTime, formatWindow } from '../../../../shared/lib/format';
import { Badge, Button, OrderCard, Stars } from '../../../../shared/ui';
import { styles } from './styles';

type Props = {
  order: OrderDetail;
  from: LatLng;
  onOpen: () => void;
  onReview: () => void;
};

/** One order on My orders: current ones lead to the code; past ones to a review. */
export function MyOrderCard({ order, from, onOpen, onReview }: Props) {
  const { t } = useTranslation();
  const { store, bag, displayStatus } = order;
  const totalMinor = order.unitPriceMinor * order.qty;
  const badge = <Badge tone={displayStatus} label={t(`ui.status.${displayStatus}`)} />;

  if (displayStatus === 'reserved' || displayStatus === 'ready') {
    return (
      <OrderCard
        storeId={store.id}
        storeName={store.name}
        bagTitle={bag.title}
        qty={order.qty}
        badge={badge}
        meta={[
          formatWindow(bag.pickupStart, bag.pickupEnd, store.timezone),
          formatDistance(haversineKm(from, store)),
        ]}
        note={t('orders.payAtStore')}
        totalMinor={totalMinor}
        actions={
          <Button
            size="sm"
            variant={displayStatus === 'ready' ? 'primary' : 'secondary'}
            label={displayStatus === 'ready' ? t('orders.showCode') : t('orders.view')}
            onPress={onOpen}
          />
        }
      />
    );
  }

  const footnote =
    displayStatus === 'cancelled' ? (
      <Text style={styles.caption}>
        {t('orders.cancelledAt', {
          time: formatTime(order.cancelledAt ?? order.createdAt, store.timezone),
        })}
      </Text>
    ) : displayStatus === 'missed' ? (
      <Text style={styles.caption}>{t('orders.missed')}</Text>
    ) : order.rating ? (
      <View style={styles.rated}>
        <Text style={styles.caption}>{t('orders.youRated')}</Text>
        <Stars value={order.rating} />
      </View>
    ) : (
      <Button size="sm" variant="ghost" label={t('orders.leaveReview')} onPress={onReview} />
    );

  return (
    <OrderCard
      storeId={store.id}
      storeName={store.name}
      bagTitle={bag.title}
      qty={order.qty}
      badge={badge}
      meta={[formatDay(bag.pickupStart, store.timezone)]}
      totalMinor={totalMinor}
      actions={footnote}
    />
  );
}
