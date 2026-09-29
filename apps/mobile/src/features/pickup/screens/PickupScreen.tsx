import { deriveOrderStatus, haversineKm, type OrderDetail, orderNumber } from '@leftover/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Text, View } from 'react-native';
import { ApiError } from '../../../shared/api/client';
import { useOrder } from '../../../shared/api/use-order';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { directionsUrl } from '../../../shared/lib/directions';
import { formatDistance, formatMoney, formatTime } from '../../../shared/lib/format';
import { useLocation } from '../../../shared/store/location';
import {
  Badge,
  Banner,
  Button,
  EmptyBagArt,
  EmptyState,
  Header,
  OfflineArt,
  Screen,
  Sheet,
  Skeleton,
  StoreLogo,
  Ticket,
} from '../../../shared/ui';
import { useCancelOrder } from '../api/use-cancel-order';
import { CollectedView } from '../components/CollectedView/CollectedView';
import { PickupTimeCard } from '../components/PickupTimeCard/PickupTimeCard';
import { useNow } from '../hooks/use-now';
import { useStyles } from './styles';

/**
 * Pickup / PickupCollected artboards. The code ticket, when to come (a live countdown), where,
 * and Cancel; it re-checks the order while it waits, and turns into the collected summary as
 * soon as the shop confirms the code.
 */
export function PickupScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const id = String(orderId);
  const query = useOrder(id);
  const cancel = useCancelOrder(id);
  const now = useNow();
  const from = useLocation((s) => s.selected) ?? DEFAULT_MAP_CENTER;
  const [confirming, setConfirming] = useState(false);
  const [cancelError, setCancelError] = useState(false);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/orders'));

  if (query.isPending) {
    return (
      <Screen header={<Header title={t('pickup.title')} onBack={goBack} />}>
        <View style={styles.loading} accessible accessibilityState={{ busy: true }}>
          <Skeleton style={styles.skeletonTicket} />
          <Skeleton style={styles.skeletonCard} />
        </View>
      </Screen>
    );
  }

  if (query.isError) {
    const missing = query.error instanceof ApiError && query.error.status === 404;
    return (
      <Screen header={<Header title={t('pickup.title')} onBack={goBack} />}>
        <View style={styles.centered}>
          <EmptyState
            live
            tone={missing ? 'default' : 'danger'}
            art={missing ? <EmptyBagArt /> : <OfflineArt />}
            title={missing ? t('pickup.error.notFound') : t('pickup.error.title')}
            actions={
              missing ? (
                <Button label={t('pickup.error.back')} onPress={goBack} />
              ) : (
                <Button
                  variant="secondary"
                  icon="refresh"
                  label={t('pickup.error.retry')}
                  loading={query.isFetching}
                  onPress={() => query.refetch()}
                />
              )
            }
          />
        </View>
      </Screen>
    );
  }

  // Re-derived locally so "Ready now" / "ended" follow the clock between polls.
  const order: OrderDetail = {
    ...query.data,
    displayStatus: deriveOrderStatus(
      {
        status: query.data.status,
        pickupStart: query.data.bag.pickupStart,
        pickupEnd: query.data.bag.pickupEnd,
      },
      now,
    ),
  };
  const { store, bag } = order;

  if (order.displayStatus === 'collected') {
    return (
      <Screen scroll header={<Header onBack={goBack} backIcon="close" />}>
        <CollectedView
          order={order}
          onRate={(overall) =>
            router.push({
              pathname: '/review/[orderId]',
              params: overall ? { orderId: id, overall: String(overall) } : { orderId: id },
            })
          }
          onDone={() => router.navigate('/discover')}
        />
      </Screen>
    );
  }

  const totalMinor = order.unitPriceMinor * order.qty;
  const statusTone = order.displayStatus;

  const confirmCancel = () => {
    setCancelError(false);
    cancel.mutate(undefined, {
      onSuccess: () => setConfirming(false),
      onError: () => {
        setConfirming(false);
        setCancelError(true);
      },
    });
  };

  return (
    <Screen scroll header={<Header title={t('pickup.title')} onBack={goBack} />}>
      <View style={styles.content}>
        <View style={styles.statusRow}>
          <Badge tone={statusTone} label={t(`ui.status.${order.displayStatus}`)} />
          <Text style={styles.caption}>{t('pickup.order', { number: orderNumber(order.id) })}</Text>
        </View>

        {order.displayStatus === 'cancelled' ? (
          <Banner
            title={t('pickup.cancelled.title')}
            text={t('pickup.cancelled.text', {
              time: formatTime(order.cancelledAt ?? order.createdAt, store.timezone),
            })}
          />
        ) : null}
        {cancelError ? <Banner tone="danger" title={t('pickup.cancelFailed')} /> : null}

        <Ticket
          code={order.code}
          bandLabel={t('pickup.band')}
          summary={
            <Text style={styles.summary}>
              {t('pickup.summary', {
                qty: order.qty,
                title: bag.title,
                amount: formatMoney(totalMinor),
              })}
            </Text>
          }
          footer={
            <View style={styles.storeRow}>
              <StoreLogo id={store.id} name={store.name} />
              <View style={styles.storeText}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.caption}>
                  {t('pickup.where', {
                    address: store.address,
                    distance: formatDistance(haversineKm(from, store)),
                  })}
                </Text>
              </View>
              <Button
                variant="secondary"
                size="sm"
                icon="directions"
                label={t('storeDetail.directions')}
                onPress={() => Linking.openURL(directionsUrl(store, store.name))}
              />
            </View>
          }
        />

        {order.displayStatus !== 'cancelled' ? (
          <PickupTimeCard order={order} now={now} reservedAt={order.createdAt} />
        ) : null}

        {order.displayStatus === 'reserved' || order.displayStatus === 'ready' ? (
          <View style={styles.cancel}>
            <Button
              variant="danger"
              label={t('pickup.cancel')}
              onPress={() => setConfirming(true)}
            />
            <Text style={[styles.caption, styles.center]}>{t('pickup.cancelNote')}</Text>
          </View>
        ) : null}
      </View>

      <Sheet
        visible={confirming}
        onClose={() => setConfirming(false)}
        title={t('pickup.cancelSheet.title')}
        text={t('pickup.cancelSheet.text')}
      >
        <Button
          block
          variant="danger"
          label={t('pickup.cancelSheet.confirm')}
          loading={cancel.isPending}
          onPress={confirmCancel}
        />
        <Button
          block
          variant="secondary"
          label={t('ui.sheet.cancel')}
          onPress={() => setConfirming(false)}
        />
      </Sheet>
    </Screen>
  );
}
