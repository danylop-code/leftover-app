import type { OpenStatus } from '@leftover/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, NetworkError } from '../../../shared/api/client';
import { useStoreDetail } from '../../../shared/api/use-store-detail';
import { useToggleFavorite } from '../../../shared/api/use-toggle-favorite';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { RATING_DECIMALS } from '../../../shared/constants/ui';
import { directionsUrl } from '../../../shared/lib/directions';
import { useToast } from '../../../shared/lib/use-toast';
import { useLocation } from '../../../shared/store/location';
import {
  Button,
  CategoryMedia,
  EmptyBagArt,
  EmptyState,
  FavoriteButton,
  Header,
  IconButton,
  OfflineArt,
  Screen,
  Skeleton,
  Star,
  StoreLogo,
  Toast,
} from '../../../shared/ui';
import { AddressCard } from '../components/AddressCard/AddressCard';
import { RatingsCard } from '../components/RatingsCard/RatingsCard';
import { ReviewCard } from '../components/ReviewCard/ReviewCard';
import { StoreBagRow } from '../components/StoreBagRow/StoreBagRow';
import { backPosition, STAR_SIZE, useStyles } from './styles';

const statusKey: Record<OpenStatus, 'openToday' | 'opensLater' | 'opensTomorrow'> = {
  open: 'openToday',
  beforeOpening: 'opensLater',
  afterClosing: 'opensTomorrow',
};

/**
 * StoreDetail artboard: hero, logo and name, hours, rating, address with Directions, and
 * today's bags (sold-out ones dimmed). Ratings appear once the shop has some (13).
 */
export function StoreDetailScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const from = useLocation((s) => s.selected) ?? DEFAULT_MAP_CENTER;
  const detail = useStoreDetail(String(id), { lat: from.lat, lng: from.lng });
  const toggleFavorite = useToggleFavorite();
  const [toast, showToast] = useToast();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/discover'));

  if (detail.isPending) {
    return (
      <Screen padded={false} header={<Header onBack={goBack} />}>
        <View
          style={styles.loading}
          accessible
          accessibilityLabel={t('discover.finding')}
          accessibilityState={{ busy: true }}
        >
          <Skeleton style={styles.skeletonHero} />
          <Skeleton style={styles.skeletonTitle} />
          <Skeleton style={styles.skeletonLine} />
        </View>
      </Screen>
    );
  }

  if (detail.isError) {
    const notFound = detail.error instanceof ApiError && detail.error.status === 404;
    return (
      <Screen header={<Header onBack={goBack} />}>
        <View style={styles.centered}>
          {notFound ? (
            <EmptyState
              live
              art={<EmptyBagArt />}
              title={t('storeDetail.notFound.title')}
              text={t('storeDetail.notFound.text')}
              actions={<Button label={t('storeDetail.notFound.back')} onPress={goBack} />}
            />
          ) : (
            <EmptyState
              live
              tone="danger"
              art={<OfflineArt />}
              title={t('storeDetail.error.title')}
              text={
                detail.error instanceof NetworkError
                  ? t('storeDetail.error.offline')
                  : t('storeDetail.error.server')
              }
              actions={
                <Button
                  variant="secondary"
                  icon="refresh"
                  label={t('storeDetail.error.retry')}
                  loading={detail.isFetching}
                  onPress={() => detail.refetch()}
                />
              }
            />
          )}
        </View>
      </Screen>
    );
  }

  const { store, rating, counts } = detail.data;
  const openDirections = () => Linking.openURL(directionsUrl(store, store.name));
  const reserve = (bagId: string) =>
    router.push({ pathname: '/reserve/[bagId]', params: { bagId, storeId: store.id } });
  const setSaved = () =>
    toggleFavorite.mutate(
      { storeId: store.id, save: !detail.data.isFavorite },
      { onError: () => showToast({ message: t('ui.favorite.failed'), tone: 'error' }) },
    );

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <CategoryMedia category={store.category} variant="hero">
          <View style={[styles.heroBar, backPosition(insets.top)]}>
            <IconButton icon="back" variant="filled" label={t('ui.back')} onPress={goBack} />
            <FavoriteButton name={store.name} saved={detail.data.isFavorite} onToggle={setSaved} />
          </View>
        </CategoryMedia>
        <View style={styles.content}>
          <View style={styles.logo}>
            <StoreLogo id={store.id} name={store.name} size="xl" />
          </View>
          <View style={styles.intro}>
            <Text style={styles.name} accessibilityRole="header">
              {store.name}
            </Text>
            <View style={styles.facts}>
              <Text style={styles.fact}>{t(`categories.${store.category}`)}</Text>
              <View style={styles.sep} />
              <Text style={styles.fact}>
                {t(`storeDetail.${statusKey[detail.data.openStatus]}`, {
                  opens: store.opensAt,
                  closes: store.closesAt,
                })}
              </Text>
            </View>
            {rating ? (
              <View style={styles.facts}>
                <View style={styles.rating}>
                  <Star size={STAR_SIZE} on />
                  <Text style={styles.ratingValue}>{rating.average.toFixed(RATING_DECIMALS)}</Text>
                </View>
                <Text style={styles.fact}>
                  {t('storeDetail.ratingCount', { count: rating.count })}
                </Text>
              </View>
            ) : null}
          </View>

          <AddressCard
            address={store.address}
            distanceKm={detail.data.distanceKm}
            onDirections={openDirections}
          />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {t('storeDetail.available')}
              </Text>
              <Text style={styles.sectionStatus}>
                {t('storeDetail.counts', { available: counts.available, total: counts.total })}
              </Text>
            </View>
            {detail.data.bags.length === 0 ? (
              <Text style={styles.noBags}>{t('storeDetail.noBags')}</Text>
            ) : (
              detail.data.bags.map((bag) => (
                <StoreBagRow
                  key={bag.id}
                  bag={bag}
                  store={store}
                  onReserve={() => reserve(bag.id)}
                />
              ))
            )}
          </View>

          {rating ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {t('storeDetail.ratings')}
              </Text>
              <RatingsCard rating={rating} />
            </View>
          ) : null}

          {detail.data.recentReviews.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {t('storeDetail.recentReviews')}
              </Text>
              {detail.data.recentReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
      {toast ? (
        <View style={styles.toast}>
          <Toast message={toast.message} tone={toast.tone} />
        </View>
      ) : null}
    </View>
  );
}
