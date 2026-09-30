import { haversineKm, MAX_QTY_PER_ORDER } from '@leftover/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ApiError, NetworkError } from '../../../shared/api/client';
import { useStoreDetail } from '../../../shared/api/use-store-detail';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { isolateIn } from '../../../shared/i18n/bidi';
import {
  dayKind,
  formatDay,
  formatDistance,
  formatMoney,
  formatTimeRange,
} from '../../../shared/lib/format';
import { useLocation } from '../../../shared/store/location';
import { useTheme } from '../../../shared/theme';
import {
  Badge,
  BagRow,
  Banner,
  BottomBar,
  Button,
  CategoryMedia,
  EmptyBagArt,
  EmptyState,
  Header,
  Icon,
  Price,
  Screen,
  Skeleton,
  Stepper,
  stockTone,
} from '../../../shared/ui';
import { useCreateOrder } from '../api/use-create-order';
import { useStyles } from './styles';

type Failure = 'soldOut' | 'notAvailable';

/**
 * Reserve / ReserveSoldOut artboards: quantity, pickup time and place, "pay at the store",
 * and the total. If the bag sells out meanwhile, nothing is reserved and the shop's other
 * available bags are offered instead.
 */
export function ReserveScreen() {
  const { clockColor, styles } = useStyles();
  const { direction } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { bagId, storeId } = useLocalSearchParams<{ bagId: string; storeId: string }>();
  const from = useLocation((s) => s.selected) ?? DEFAULT_MAP_CENTER;
  const detail = useStoreDetail(String(storeId), { lat: from.lat, lng: from.lng });
  const createOrder = useCreateOrder();
  const [qty, setQty] = useState(1);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/discover'));
  const header = <Header title={t('reserve.title')} onBack={close} backIcon="close" />;

  if (detail.isPending) {
    return (
      <Screen header={header}>
        <View style={styles.loading} accessible accessibilityState={{ busy: true }}>
          <Skeleton style={styles.skeletonRow} />
          <Skeleton style={styles.skeletonCard} />
        </View>
      </Screen>
    );
  }

  const bag = detail.data?.bags.find((b) => b.id === bagId);
  if (!detail.data || !bag) {
    return (
      <Screen header={header}>
        <View style={styles.centered}>
          <EmptyState
            live
            art={<EmptyBagArt />}
            title={t('reserve.missing.title')}
            text={t('reserve.missing.text')}
            actions={<Button label={t('storeDetail.notFound.back')} onPress={close} />}
          />
        </View>
      </Screen>
    );
  }

  const { store } = detail.data;
  const out = failure !== null || bag.qtyAvailable <= 0;
  const maxQty = Math.max(1, Math.min(bag.qtyAvailable, MAX_QTY_PER_ORDER));
  const shownQty = out ? 0 : Math.min(qty, maxQty);
  const totalMinor = bag.priceMinor * Math.max(shownQty, 1);
  const originalMinor = bag.originalPriceMinor * Math.max(shownQty, 1);
  const kind = dayKind(bag.pickupStart, store.timezone);
  const pickupCaption =
    kind === 'today'
      ? t('reserve.pickupToday')
      : kind === 'tomorrow'
        ? t('reserve.pickupTomorrow')
        : t('reserve.pickupOn', { date: formatDay(bag.pickupStart, store.timezone) });
  const others = detail.data.bags.filter((b) => b.id !== bag.id && b.qtyAvailable > 0);

  const reserve = () => {
    setNotice(null);
    createOrder.mutate(
      { bagId: bag.id, qty: shownQty },
      {
        onSuccess: (order) => router.replace(`/pickup/${order.id}`),
        onError: (error) => {
          if (error instanceof ApiError && error.code === 'sold_out') {
            const left = Number(error.details.qtyAvailable ?? 0);
            if (left > 0) {
              setQty(Math.min(qty, left));
              setNotice(t('reserve.fewerLeft', { count: left }));
            } else setFailure('soldOut');
            return;
          }
          if (error instanceof ApiError && error.code === 'not_available') {
            setFailure('notAvailable');
            return;
          }
          setNotice(error instanceof NetworkError ? t('errors.network') : t('errors.generic'));
        },
      },
    );
  };

  const stock = out ? t('ui.stock.soldOut') : t('ui.stock.left', { count: bag.qtyAvailable });
  const tone = out ? 'out' : stockTone(bag.qtyAvailable);

  return (
    <Screen
      scroll
      header={header}
      edges={['top']}
      footer={
        <BottomBar>
          {out ? (
            <>
              <Button block disabled label={t('reserve.soldOut.button')} />
              <Button
                block
                variant="ghost"
                label={t('reserve.soldOut.nearby')}
                onPress={() => router.navigate('/discover')}
              />
            </>
          ) : (
            <>
              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>{t('reserve.total')}</Text>
                  <Text style={styles.saving}>
                    {t('reserve.save', { amount: formatMoney(originalMinor - totalMinor) })}
                  </Text>
                </View>
                <Price
                  priceMinor={totalMinor}
                  originalMinor={originalMinor}
                  size="lg"
                  align="end"
                />
              </View>
              <Button
                block
                label={t('reserve.submit', { amount: formatMoney(totalMinor) })}
                loading={createOrder.isPending}
                onPress={reserve}
              />
            </>
          )}
        </BottomBar>
      }
    >
      <View style={styles.content}>
        {failure ? (
          <Banner
            tone="danger"
            title={t(`reserve.${failure}.title`)}
            text={t(`reserve.${failure}.text`)}
          />
        ) : null}
        {notice ? <Banner tone="warning" title={notice} /> : null}

        <View style={[styles.summary, out && styles.dimmed]}>
          <CategoryMedia category={bag.category} variant="tile" photo={bag.photoUrl} />
          <View style={styles.summaryBody}>
            <Text style={styles.store}>{store.name}</Text>
            <Text style={styles.bagTitle} accessibilityRole="header">
              {bag.title}
            </Text>
            <Price
              priceMinor={bag.priceMinor}
              originalMinor={bag.originalPriceMinor}
              soldOut={out}
            />
          </View>
        </View>

        {!out && bag.description ? (
          <Text style={styles.description}>{isolateIn(direction, bag.description)}</Text>
        ) : null}

        <View style={styles.card}>
          <View style={styles.qtyText}>
            <Text style={styles.cardLabel}>{t('reserve.quantity')}</Text>
            <Badge tone={tone} label={stock} onSunken={tone === 'stock'} />
          </View>
          <Stepper
            value={shownQty}
            min={out ? 0 : 1}
            max={out ? 0 : maxQty}
            onChange={setQty}
            decreaseLabel={t('reserve.fewer')}
            increaseLabel={t('reserve.more')}
          />
        </View>

        {out ? (
          others.length > 0 ? (
            <View style={styles.others}>
              <Text style={styles.othersTitle} accessibilityRole="header">
                {t('reserve.soldOut.others')}
              </Text>
              {others.map((other) => (
                <BagRow
                  key={other.id}
                  title={other.title}
                  category={other.category}
                  photoUrl={other.photoUrl}
                  meta={formatTimeRange(other.pickupStart, other.pickupEnd, store.timezone)}
                  priceMinor={other.priceMinor}
                  originalPriceMinor={other.originalPriceMinor}
                  badge={
                    <Badge
                      tone={stockTone(other.qtyAvailable)}
                      label={t('ui.stock.left', { count: other.qtyAvailable })}
                    />
                  }
                  accessibilityLabel={other.title}
                  onPress={() => {
                    setFailure(null);
                    setQty(1);
                    router.setParams({ bagId: other.id });
                  }}
                />
              ))}
            </View>
          ) : null
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.clock}>
                <Icon name="clock" size="lg" color={clockColor} />
              </View>
              <View style={styles.pickupText}>
                <Text style={styles.caption}>{pickupCaption}</Text>
                <Text style={styles.pickupTime}>
                  {formatTimeRange(bag.pickupStart, bag.pickupEnd, store.timezone)}
                </Text>
                <Text style={styles.caption}>
                  {t('reserve.where', {
                    address: store.address,
                    distance: formatDistance(haversineKm(from, store)),
                  })}
                </Text>
              </View>
            </View>
            <Banner icon="card" title={t('reserve.payTitle')} text={t('reserve.payText')} />
          </>
        )}
      </View>
    </Screen>
  );
}
