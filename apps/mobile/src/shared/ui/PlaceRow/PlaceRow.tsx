import type { Place } from '@leftover/shared';
import { Pressable, Text, View } from 'react-native';
import { SINGLE_LINE } from '../../constants/ui';
import { formatDistance } from '../../lib/format';
import { splitMatch } from '../../lib/highlight';
import { Icon } from '../icons';
import { iconColor, styles } from './styles';

type Props = {
  place: Place;
  onPress: () => void;
  /** `pin`: a suggestion · `clock`: a recent place. */
  icon?: 'pin' | 'clock';
  /** Typed text, bolded where it matches the label. */
  query?: string;
  distanceKm?: number;
  last?: boolean;
};

/** An address in a list (LocationSearch, address autocomplete): label, locality, distance. */
export function PlaceRow({ place, onPress, icon = 'pin', query = '', distanceKm, last }: Props) {
  const distance = distanceKm === undefined ? undefined : formatDistance(distanceKm);
  const name = [place.label, place.secondary, distance].filter(Boolean).join(', ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [styles.row, last && styles.last, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Icon name={icon} color={iconColor} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label} numberOfLines={SINGLE_LINE}>
          {splitMatch(place.label, query).map((part) => (
            <Text key={part.start} style={part.match && styles.match}>
              {part.text}
            </Text>
          ))}
        </Text>
        {place.secondary ? (
          <Text style={styles.secondary} numberOfLines={SINGLE_LINE}>
            {place.secondary}
          </Text>
        ) : null}
      </View>
      {distance ? <Text style={styles.distance}>{distance}</Text> : null}
    </Pressable>
  );
}
