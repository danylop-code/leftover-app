import type { SavedShop } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useToggleFavorite } from '../../../shared/api/use-toggle-favorite';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { formatDistance } from '../../../shared/lib/format';
import { useToast } from '../../../shared/lib/use-toast';
import { useLocation } from '../../../shared/store/location';
import {
  Button,
  EmptyBagArt,
  EmptyState,
  FavoriteButton,
  HeaderLarge,
  OfflineArt,
  Screen,
  Skeleton,
  StoreRow,
  Toast,
  useTabBarInset,
} from '../../../shared/ui';
import { useSavedShops } from '../api/use-saved-shops';
import { useStyles } from './styles';

/**
 * The Saved tab (not in the design): shops the customer hearted, nearest first, with how many
 * bags they have on offer. Tap to open the shop; the heart unsaves.
 */
export function SavedScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const from = useLocation((s) => s.selected) ?? DEFAULT_MAP_CENTER;
  const shops = useSavedShops({ lat: from.lat, lng: from.lng });
  const toggleFavorite = useToggleFavorite();
  const [toast, showToast] = useToast();
  const [pulling, setPulling] = useState(false);
  const tabBarInset = useTabBarInset();

  const unsave = (shop: SavedShop) =>
    toggleFavorite.mutate(
      { storeId: shop.store.id, save: false },
      { onError: () => showToast({ message: t('ui.favorite.failed'), tone: 'error' }) },
    );

  const refresh = async () => {
    setPulling(true);
    await shops.refetch();
    setPulling(false);
  };

  const meta = (shop: SavedShop) =>
    [
      t('saved.meta', {
        category: t(`categories.${shop.store.category}`),
        distance: formatDistance(shop.distanceKm),
      }),
      shop.bagsAvailable > 0 ? t('saved.bags', { count: shop.bagsAvailable }) : t('saved.noBags'),
    ].join(' · ');

  const body = () => {
    if (shops.isPending) {
      return (
        <View style={styles.list} accessible accessibilityState={{ busy: true }}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      );
    }
    if (shops.isError) {
      return (
        <View style={styles.centered}>
          <EmptyState
            live
            tone="danger"
            art={<OfflineArt />}
            title={t('saved.error.title')}
            actions={
              <Button
                variant="secondary"
                icon="refresh"
                label={t('saved.error.retry')}
                loading={shops.isFetching}
                onPress={() => shops.refetch()}
              />
            }
          />
        </View>
      );
    }
    if (shops.data.length === 0) {
      return (
        <View style={styles.centered}>
          <EmptyState
            art={<EmptyBagArt />}
            title={t('saved.empty.title')}
            text={t('saved.empty.text')}
            actions={
              <Button
                label={t('saved.empty.action')}
                onPress={() => router.navigate('/discover')}
              />
            }
          />
        </View>
      );
    }
    return (
      <FlatList
        data={shops.data}
        keyExtractor={(s) => s.store.id}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
        renderItem={({ item }) => (
          // The heart sits beside the row, not inside it: a screen reader reads a pressable row
          // as one element, which would hide a button nested in it.
          <View style={styles.card}>
            <View style={styles.row}>
              <StoreRow
                storeId={item.store.id}
                name={item.store.name}
                logoUrl={item.store.logoUrl}
                meta={meta(item)}
                onPress={() =>
                  router.push({ pathname: '/store/[id]', params: { id: item.store.id } })
                }
              />
            </View>
            <FavoriteButton name={item.store.name} saved onToggle={() => unsave(item)} />
          </View>
        )}
        refreshing={pulling}
        onRefresh={refresh}
      />
    );
  };

  return (
    <Screen
      padded={false}
      bottomInset={shops.data && shops.data.length > 0 ? 0 : tabBarInset}
      header={<HeaderLarge title={t('saved.title')} />}
    >
      {body()}
      {toast ? (
        <View style={[styles.toast, { bottom: tabBarInset }]}>
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </Screen>
  );
}
