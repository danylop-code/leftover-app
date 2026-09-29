import type { OrdersScope } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { useLocation } from '../../../shared/store/location';
import {
  Button,
  EmptyBagArt,
  EmptyState,
  HeaderLarge,
  OfflineArt,
  Screen,
  Segmented,
  Skeleton,
  useTabBarInset,
} from '../../../shared/ui';
import { useMyOrders } from '../api/use-my-orders';
import { MyOrderCard } from '../components/MyOrderCard/MyOrderCard';
import { styles } from './styles';

/** Orders / OrdersPast / OrdersEmpty artboards: current reservations and past pickups. */
export function OrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [scope, setScope] = useState<OrdersScope>('current');
  const from = useLocation((s) => s.selected) ?? DEFAULT_MAP_CENTER;
  const orders = useMyOrders(scope);
  const [pulling, setPulling] = useState(false);
  const tabBarInset = useTabBarInset();

  const refresh = async () => {
    setPulling(true);
    await orders.refetch();
    setPulling(false);
  };

  const segment = (
    <Segmented
      value={scope}
      onChange={setScope}
      options={[
        {
          value: 'current',
          label: t('orders.current'),
          count: orders.data?.currentCount || undefined,
        },
        { value: 'past', label: t('orders.past') },
      ]}
    />
  );

  const body = () => {
    if (orders.isPending) {
      return (
        <View style={styles.list} accessible accessibilityState={{ busy: true }}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      );
    }
    if (orders.isError) {
      return (
        <View style={styles.centered}>
          <EmptyState
            live
            tone="danger"
            art={<OfflineArt />}
            title={t('orders.error.title')}
            actions={
              <Button
                variant="secondary"
                icon="refresh"
                label={t('orders.error.retry')}
                loading={orders.isFetching}
                onPress={() => orders.refetch()}
              />
            }
          />
        </View>
      );
    }
    if (orders.data.orders.length === 0) {
      return (
        <View style={styles.centered}>
          {scope === 'current' ? (
            <EmptyState
              art={<EmptyBagArt />}
              title={t('orders.empty.title')}
              text={t('orders.empty.text')}
              actions={
                <Button
                  label={t('orders.empty.action')}
                  onPress={() => router.navigate('/discover')}
                />
              }
            />
          ) : (
            <EmptyState
              art={<EmptyBagArt />}
              title={t('orders.emptyPast.title')}
              text={t('orders.emptyPast.text')}
            />
          )}
        </View>
      );
    }
    return (
      <FlatList
        data={orders.data.orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
        renderItem={({ item }) => (
          <MyOrderCard
            order={item}
            from={from}
            onOpen={() =>
              router.push({ pathname: '/pickup/[orderId]', params: { orderId: item.id } })
            }
            onReview={() =>
              router.push({ pathname: '/review/[orderId]', params: { orderId: item.id } })
            }
          />
        )}
        refreshing={pulling}
        onRefresh={refresh}
      />
    );
  };

  return (
    <Screen
      padded={false}
      bottomInset={orders.data && orders.data.orders.length > 0 ? 0 : tabBarInset}
      header={
        <View>
          <HeaderLarge title={t('orders.title')} />
          <View style={styles.segment}>{segment}</View>
        </View>
      }
    >
      {body()}
    </Screen>
  );
}
