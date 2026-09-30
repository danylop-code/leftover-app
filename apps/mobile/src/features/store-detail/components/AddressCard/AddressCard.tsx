import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { isolateIn } from '../../../../shared/i18n/bidi';
import { formatDistance } from '../../../../shared/lib/format';
import { useTheme } from '../../../../shared/theme';
import { Button, Icon } from '../../../../shared/ui';
import { useStyles } from './styles';

type Props = { address: string; distanceKm: number; onDirections: () => void };

/** Where the shop is, how far from the selected location, and a Directions button. */
export function AddressCard({ address, distanceKm, onDirections }: Props) {
  const { pinColor, styles } = useStyles();
  const { t } = useTranslation();
  const { direction } = useTheme();
  return (
    <View style={styles.card}>
      <View style={styles.pin}>
        <Icon name="pin" color={pinColor} />
      </View>
      <View style={styles.text}>
        <Text style={styles.address}>{isolateIn(direction, address)}</Text>
        <Text style={styles.distance}>
          {t('storeDetail.away', { distance: formatDistance(distanceKm) })}
        </Text>
      </View>
      <Button
        variant="secondary"
        size="sm"
        icon="directions"
        label={t('storeDetail.directions')}
        onPress={onDirections}
      />
    </View>
  );
}
