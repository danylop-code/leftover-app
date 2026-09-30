import type { LatLng } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { placeAt } from '../../../shared/lib/device-geo';
import { useLocation } from '../../../shared/store/location';
import { Banner, Button, Icon, IconButton, MapPicker } from '../../../shared/ui';
import { PlaceSummary } from '../components/PlaceSummary/PlaceSummary';
import { RadiusField } from '../components/RadiusField/RadiusField';
import { useCurrentPosition } from '../hooks/use-current-position';
import { locateColor, searchIconColor, sheetPadding, styles, topPadding } from './styles';

/**
 * Location artboard: full-screen map with the pin and radius circle, a search pill, and the
 * "Where should we look?" sheet. Edits a draft; "Show results" makes it the search area.
 */
export function LocationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasSaved = useLocation((s) => s.selected !== null);
  const draft = useLocation((s) => s.draft);
  const startDraft = useLocation((s) => s.startDraft);
  const setDraftPlace = useLocation((s) => s.setDraftPlace);
  const setDraftRadius = useLocation((s) => s.setDraftRadius);
  const commitDraft = useLocation((s) => s.commitDraft);
  const position = useCurrentPosition();
  const { locate } = position;

  const locateMe = async () => {
    const before = useLocation.getState().draft.place;
    const place = await locate();
    // A pin placed (or searched) while we waited wins over a late position.
    if (place && useLocation.getState().draft.place === before) setDraftPlace(place);
  };

  // Edit from the saved area; with none yet (first run), start from the device position.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per visit to the screen.
  useEffect(() => {
    startDraft();
    if (!useLocation.getState().selected) locateMe();
  }, []);

  const movePin = async (point: LatLng) => {
    setDraftPlace({ label: t('location.droppedPin'), ...point });
    const place = await placeAt(point);
    // Only label the pin if it hasn't moved again meanwhile.
    const current = useLocation.getState().draft.place;
    if (current?.lat === point.lat && current.lng === point.lng) setDraftPlace(place);
  };

  const openSearch = () => router.push('/location-search');

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/discover'));

  const showResults = () => {
    commitDraft();
    router.replace('/discover');
  };

  return (
    <View style={styles.root}>
      <MapPicker
        style={styles.map}
        value={draft.place ?? DEFAULT_MAP_CENTER}
        onChange={movePin}
        radiusKm={draft.radiusKm}
        label={t('location.map')}
      />
      <View style={[styles.top, topPadding(insets.top)]}>
        {hasSaved ? (
          <IconButton icon="back" variant="filled" label={t('ui.back')} onPress={goBack} />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('location.search')}
          onPress={openSearch}
          style={({ pressed }) => [styles.searchPill, pressed && styles.pressed]}
        >
          <Icon name="search" color={searchIconColor} />
          <Text style={styles.searchText}>{t('location.search')}</Text>
        </Pressable>
      </View>
      <View style={styles.bottom} pointerEvents="box-none">
        <IconButton
          icon="locate"
          variant="filled"
          color={locateColor}
          label={t('location.useCurrent')}
          onPress={locateMe}
          disabled={position.status === 'locating'}
          style={styles.locate}
        />
        <View style={[styles.sheet, sheetPadding(insets.bottom)]}>
          <View style={styles.grab} />
          <Text style={styles.title} accessibilityRole="header">
            {t('location.title')}
          </Text>
          {position.status === 'denied' || position.status === 'failed' ? (
            <Banner
              tone="warning"
              icon="locate"
              title={t(`location.${position.status}.title`)}
              text={t(`location.${position.status}.text`)}
            />
          ) : null}
          <PlaceSummary
            place={draft.place}
            locating={position.status === 'locating'}
            onChange={openSearch}
          />
          <RadiusField value={draft.radiusKm} onChange={setDraftRadius} />
          <Button
            block
            label={t('location.showResults')}
            disabled={!draft.place}
            onPress={showResults}
          />
        </View>
      </View>
    </View>
  );
}
