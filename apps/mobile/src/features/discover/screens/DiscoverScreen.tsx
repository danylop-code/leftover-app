import type { Category, NearbyBag } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import { NetworkError } from '../../../shared/api/client';
import { DISCOVER_CATEGORIES, DISCOVER_SKELETON_CARDS } from '../../../shared/constants/discover';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { useLocation } from '../../../shared/store/location';
import {
  BagCard,
  Button,
  Chip,
  ChipRow,
  EmptyBagArt,
  EmptyState,
  IconButton,
  OfflineArt,
  Screen,
} from '../../../shared/ui';
import { useNearbyBags } from '../api/use-nearby-bags';
import { BagCardSkeleton } from '../components/BagCardSkeleton/BagCardSkeleton';
import { LocationPill } from '../components/LocationPill/LocationPill';
import { styles } from './styles';

const skeletons = Array.from({ length: DISCOVER_SKELETON_CARDS }, (_, i) => i);

/**
 * Discover artboards: today's bags near the selected location, filtered by category, with
 * loading (DiscoverLoading), empty (DiscoverEmpty) and error (DiscoverError) states.
 */
export function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const selected = useLocation((s) => s.selected);
  const radiusKm = useLocation((s) => s.radiusKm);
  const [category, setCategory] = useState<Category | null>(null);
  const [pulling, setPulling] = useState(false);
  // The tabs sit behind LocationGate, so `selected` is set; the fallback only keeps hooks unconditional.
  const where = selected ?? DEFAULT_MAP_CENTER;
  const nearby = useNearbyBags(
    { lat: where.lat, lng: where.lng, radiusKm, category },
    selected !== null,
  );

  const openLocation = () => router.push('/location');
  const openBag = (bag: NearbyBag) =>
    router.push({ pathname: '/store/[id]', params: { id: bag.store.id } });

  const refresh = async () => {
    setPulling(true);
    await nearby.refetch();
    setPulling(false);
  };

  const sectionHeader = (status: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('discover.section')}
      </Text>
      <Text style={styles.sectionStatus}>{status}</Text>
    </View>
  );

  const body = () => {
    if (nearby.isPending) {
      return (
        <View
          style={styles.list}
          accessible
          accessibilityLabel={t('discover.loading')}
          accessibilityState={{ busy: true }}
        >
          {sectionHeader(t('discover.finding'))}
          {skeletons.map((i) => (
            <BagCardSkeleton key={i} compact={i > 0} />
          ))}
        </View>
      );
    }
    if (nearby.isError) {
      return (
        <View style={styles.centered}>
          <EmptyState
            live
            tone="danger"
            art={<OfflineArt />}
            title={t('discover.error.title')}
            text={
              nearby.error instanceof NetworkError
                ? t('discover.error.offline')
                : t('discover.error.server')
            }
            actions={
              <Button
                variant="secondary"
                icon="refresh"
                label={t('discover.error.retry')}
                loading={nearby.isFetching}
                onPress={() => nearby.refetch()}
              />
            }
          />
        </View>
      );
    }
    if (nearby.data.length === 0) {
      return (
        <View style={styles.centered}>
          <EmptyState
            live
            art={<EmptyBagArt />}
            title={t('discover.empty.title')}
            text={
              category
                ? t('discover.empty.textFiltered', {
                    noun: t(`discover.noun.${category}`),
                    km: radiusKm,
                  })
                : t('discover.empty.text', { km: radiusKm })
            }
            actions={
              <>
                <Button label={t('discover.empty.changeLocation')} onPress={openLocation} />
                {category ? (
                  <Button
                    variant="ghost"
                    label={t('discover.empty.showAll')}
                    onPress={() => setCategory(null)}
                  />
                ) : null}
              </>
            }
          />
        </View>
      );
    }
    return (
      <FlatList
        testID="discover-list"
        data={nearby.data}
        keyExtractor={(bag) => bag.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={sectionHeader(t('discover.count', { count: nearby.data.length }))}
        renderItem={({ item }) => (
          <BagCard
            title={item.title}
            category={item.category}
            storeId={item.store.id}
            storeName={item.store.name}
            pickupStart={item.pickupStart}
            pickupEnd={item.pickupEnd}
            timezone={item.store.timezone}
            qtyAvailable={item.qtyAvailable}
            priceMinor={item.priceMinor}
            originalPriceMinor={item.originalPriceMinor}
            distanceKm={item.distanceKm}
            onPress={() => openBag(item)}
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
      header={
        <View>
          <View style={styles.top}>
            <LocationPill
              label={selected?.label ?? ''}
              radiusKm={radiusKm}
              onPress={openLocation}
            />
            <IconButton
              icon="map"
              variant="filled"
              label={t('discover.mapView')}
              onPress={openLocation}
              style={styles.mapButton}
            />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {t('discover.title')}
          </Text>
          <ChipRow accessibilityLabel={t('discover.categories')}>
            <Chip
              label={t('discover.all')}
              selected={category === null}
              onPress={() => setCategory(null)}
            />
            {DISCOVER_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={t(`categories.${c}`)}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </ChipRow>
        </View>
      }
    >
      {body()}
    </Screen>
  );
}
