import { haversineKm, type Place, type PlaceSuggestion } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useAddressSuggestions } from '../../../shared/api/use-address-suggestions';
import { useLocation } from '../../../shared/store/location';
import { Banner, Icon, IconButton, Input, ListGroup, PlaceRow, Screen } from '../../../shared/ui';
import { useCurrentPosition } from '../hooks/use-current-position';
import { useStyles } from './styles';

/**
 * LocationSearch artboard: address search with suggestions (distance from the current pin),
 * "Use my current location" and recent places. Choosing one sets the pin and goes back.
 */
export function LocationSearchScreen() {
  const { clearColor, locateColor, styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const [text, setText] = useState('');
  const pin = useLocation((s) => s.draft.place);
  const recent = useLocation((s) => s.recent);
  const setDraftPlace = useLocation((s) => s.setDraftPlace);
  const addRecent = useLocation((s) => s.addRecent);
  const position = useCurrentPosition();
  const near = pin ? { lat: pin.lat, lng: pin.lng } : null;
  const suggestions = useAddressSuggestions(text, near);

  const choose = (place: Place) => {
    setDraftPlace(place);
    addRecent(place);
    router.back();
  };

  const chooseSuggestion = ({ id: _id, ...place }: PlaceSuggestion) => choose(place);

  const locateMe = async () => {
    const place = await position.locate();
    if (!place) return;
    setDraftPlace(place);
    router.back();
  };

  const typing = text.trim().length > 0;

  return (
    <Screen
      scroll
      header={
        <View style={styles.searchHeader}>
          <IconButton
            icon="back"
            label={t('ui.back')}
            onPress={() => router.back()}
            style={styles.back}
          />
          <View style={styles.searchField}>
            {/* The artboard's label is screen-reader-only (`.sr-only`). */}
            <Input
              accessibilityLabel={t('location.searchScreen.field')}
              pill
              icon="search"
              value={text}
              onChangeText={setText}
              placeholder={t('location.search')}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
              right={
                typing ? (
                  <IconButton
                    icon="close"
                    size="sm"
                    iconSize="md"
                    color={clearColor}
                    label={t('location.searchScreen.clear')}
                    onPress={() => setText('')}
                    style={styles.clear}
                  />
                ) : null
              }
            />
          </View>
        </View>
      }
    >
      <View style={styles.searchContent}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('location.useCurrent')}
          accessibilityState={{ busy: position.status === 'locating' }}
          onPress={locateMe}
          style={({ pressed }) => [styles.currentRow, pressed && styles.pressed]}
        >
          <View style={styles.currentIcon}>
            <Icon name="locate" color={locateColor} />
          </View>
          <Text style={styles.currentLabel}>
            {position.status === 'locating' ? t('location.locating') : t('location.useCurrent')}
          </Text>
        </Pressable>
        {position.status === 'denied' || position.status === 'failed' ? (
          <Banner
            tone="warning"
            icon="locate"
            title={t(`location.${position.status}.title`)}
            text={t(`location.${position.status}.text`)}
          />
        ) : null}
        {suggestions.results.length > 0 ? (
          <ListGroup label={t('location.searchScreen.suggestions')}>
            {suggestions.results.map((s, i, all) => (
              <PlaceRow
                key={s.id}
                place={s}
                query={text}
                distanceKm={near ? haversineKm(near, s) : undefined}
                onPress={() => chooseSuggestion(s)}
                last={i === all.length - 1}
              />
            ))}
          </ListGroup>
        ) : suggestions.searching || suggestions.empty ? (
          <Text style={styles.status} accessibilityLiveRegion="polite">
            {suggestions.searching
              ? t('location.searchScreen.searching')
              : t('location.searchScreen.noResults')}
          </Text>
        ) : null}
        {recent.length > 0 ? (
          <ListGroup label={t('location.searchScreen.recent')}>
            {recent.map((place, i) => (
              <PlaceRow
                key={`${place.lat},${place.lng}`}
                icon="clock"
                place={place}
                onPress={() => choose(place)}
                last={i === recent.length - 1}
              />
            ))}
          </ListGroup>
        ) : null}
      </View>
    </Screen>
  );
}
