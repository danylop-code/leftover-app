import type { Place } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SINGLE_LINE } from '../../../../shared/constants/ui';
import { Button, Icon } from '../../../../shared/ui';
import { pinColor, styles } from './styles';

type Props = {
  place: Place | null;
  locating: boolean;
  onChange: () => void;
};

/** The sheet's chosen place (`.loc-pin` + label + Change). */
export function PlaceSummary({ place, locating, onChange }: Props) {
  const { t } = useTranslation();
  // Once there's a place, show it even while a position is still being found.
  const finding = locating && !place;
  const title = finding ? t('location.locating') : (place?.label ?? t('location.noPlace'));
  return (
    <View style={styles.root}>
      <View style={styles.pin}>
        <Icon name="pin" color={pinColor} />
      </View>
      <View style={styles.text} accessible accessibilityLiveRegion="polite">
        <Text style={place ? styles.label : styles.hint} numberOfLines={SINGLE_LINE}>
          {title}
        </Text>
        {place?.secondary ? (
          <Text style={styles.secondary} numberOfLines={SINGLE_LINE}>
            {place.secondary}
          </Text>
        ) : null}
      </View>
      <View style={styles.change}>
        <Button variant="ghost" size="sm" label={t('location.change')} onPress={onChange} />
      </View>
    </View>
  );
}
