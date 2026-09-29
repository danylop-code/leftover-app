import { haversineKm, type LatLng, type Place } from '@leftover/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useAddressSuggestions } from '../../api/use-address-suggestions';
import { Input } from '../Field/Input';
import { PlaceRow } from '../PlaceRow/PlaceRow';
import { useStyles } from './styles';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** A suggestion was chosen; the field then shows its label. */
  onSelect: (place: Place) => void;
  /** Biases suggestions and measures their distance. */
  near: LatLng | null;
  placeholder?: string;
};

/**
 * Address field with suggestions while typing (API provider, on-device fallback). Sits inside
 * a <Field>, which gives it its label and error state. Used by shop setup; LocationSearch
 * lays out the same suggestions as a full screen.
 */
export function AddressAutocomplete({ value, onChangeText, onSelect, near, placeholder }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const [chosen, setChosen] = useState<string | null>(null);
  // Closed once a suggestion is chosen, until the text changes again (no search for it).
  const open = value.trim() !== chosen;
  const suggestions = useAddressSuggestions(open ? value : '', near);

  const choose = ({ id: _id, ...place }: Place & { id: string }) => {
    setChosen(place.label);
    onChangeText(place.label);
    onSelect(place);
  };

  return (
    <View style={styles.root}>
      <Input
        icon="search"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        returnKeyType="search"
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        autoCorrect={false}
      />
      {open && suggestions.results.length > 0 ? (
        <View style={styles.list}>
          {suggestions.results.map((s, i, all) => (
            <PlaceRow
              key={s.id}
              place={s}
              query={value}
              distanceKm={near ? haversineKm(near, s) : undefined}
              onPress={() => choose(s)}
              last={i === all.length - 1}
            />
          ))}
        </View>
      ) : null}
      {open && suggestions.results.length === 0 && (suggestions.searching || suggestions.empty) ? (
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {suggestions.searching
            ? t('location.searchScreen.searching')
            : t('location.searchScreen.noResults')}
        </Text>
      ) : null}
    </View>
  );
}
