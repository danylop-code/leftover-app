import type { ShopBag } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { UNDO_TOAST_MS } from '../../../shared/constants/orders';
import { useToast } from '../../../shared/lib/use-toast';
import {
  Button,
  EmptyBagArt,
  EmptyState,
  HeaderLarge,
  OfflineArt,
  Screen,
  Skeleton,
  StatTile,
  Toast,
  useTabBarInset,
} from '../../../shared/ui';
import { useToggleBag } from '../api/use-bag-mutations';
import { useShopBags } from '../api/use-shop-bags';
import { ShopBagRow } from '../components/ShopBagRow/ShopBagRow';
import { FAB_CLEARANCE, useStyles } from './styles';

/** StoreBags / StoreBagsEmpty artboards: today's bags, live stats, pause with Undo. */
export function StoreBagsScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const bags = useShopBags();
  const toggle = useToggleBag();
  const [toast, setToast] = useToast(UNDO_TOAST_MS);
  const [pulling, setPulling] = useState(false);
  const tabBarInset = useTabBarInset();

  const addBag = () => router.push('/bag/new');
  const editBag = (bag: ShopBag) => router.push({ pathname: '/bag/[id]', params: { id: bag.id } });

  const setLive = (bag: ShopBag, isActive: boolean, withUndo = true) => {
    toggle.mutate(
      { id: bag.id, isActive },
      {
        onError: () =>
          setToast({ message: t('storeBags.toggleFailed', { title: bag.title }), tone: 'error' }),
      },
    );
    setToast({
      message: isActive
        ? t('storeBags.resumedToast', { title: bag.title })
        : t('storeBags.pausedToast', { title: bag.title }),
      tone: 'success',
      action: withUndo
        ? { label: t('storeBags.undo'), onPress: () => setLive(bag, !isActive, false) }
        : undefined,
    });
  };

  const refresh = async () => {
    setPulling(true);
    await bags.refetch();
    setPulling(false);
  };

  const body = () => {
    if (bags.isPending) {
      return (
        <View style={styles.list} accessible accessibilityState={{ busy: true }}>
          <Skeleton style={styles.skeletonStats} />
          <Skeleton style={styles.skeletonRow} />
          <Skeleton style={styles.skeletonRow} />
        </View>
      );
    }
    if (bags.isError) {
      return (
        <View style={styles.centered}>
          <EmptyState
            live
            tone="danger"
            art={<OfflineArt />}
            title={t('storeBags.error.title')}
            actions={
              <Button
                variant="secondary"
                icon="refresh"
                label={t('storeBags.error.retry')}
                loading={bags.isFetching}
                onPress={() => bags.refetch()}
              />
            }
          />
        </View>
      );
    }
    if (bags.data.bags.length === 0) {
      return (
        <View style={styles.centered}>
          <EmptyState
            art={<EmptyBagArt />}
            title={t('storeBags.empty.title')}
            text={t('storeBags.empty.text')}
            actions={<Button icon="plus" label={t('storeBags.empty.action')} onPress={addBag} />}
          />
        </View>
      );
    }
    const { stats } = bags.data;
    return (
      <FlatList
        data={bags.data.bags}
        keyExtractor={(b) => b.id}
        contentContainerStyle={[styles.list, { paddingBottom: FAB_CLEARANCE + tabBarInset }]}
        ListHeaderComponent={
          <View style={styles.stats}>
            <StatTile
              value={String(stats.liveNow)}
              label={t('storeBags.liveNow', { count: stats.liveNow })}
            />
            <StatTile
              tone="accent"
              value={String(stats.reservedToday)}
              label={t('storeBags.reservedToday')}
            />
          </View>
        }
        renderItem={({ item }) => (
          <ShopBagRow
            bag={item}
            onEdit={() => editBag(item)}
            onToggle={(isActive) => setLive(item, isActive)}
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
      header={<HeaderLarge kicker={bags.data?.storeName} title={t('storeBags.title')} />}
    >
      {body()}
      {bags.data && bags.data.bags.length > 0 ? (
        <View
          style={[styles.fab, toast && styles.fabRaised, { marginBottom: tabBarInset }]}
          pointerEvents="box-none"
        >
          <Button icon="plus" label={t('storeBags.add')} onPress={addBag} />
        </View>
      ) : null}
      {toast ? (
        <View style={[styles.toast, { bottom: tabBarInset }]}>
          <Toast message={toast.message} tone={toast.tone} action={toast.action} />
        </View>
      ) : null}
    </Screen>
  );
}
