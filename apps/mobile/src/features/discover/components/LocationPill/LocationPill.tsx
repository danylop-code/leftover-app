import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { SINGLE_LINE } from '../../../../shared/constants/ui';
import { Icon } from '../../../../shared/ui';
import { useStyles } from './styles';

type Props = { label: string; radiusKm: number; onPress: () => void };

/** `.loc-pill`: where Discover looks, and how far. Opens Location. */
export function LocationPill({ label, radiusKm, onPress }: Props) {
  const { chevronColor, pinColor, styles } = useStyles();
  const { t } = useTranslation();
  const km = t('format.km', { value: radiusKm });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('discover.pill', { label, km: radiusKm })}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.pin}>
        <Icon name="pin" color={pinColor} />
      </View>
      <View style={styles.text}>
        <Text style={styles.caption}>{t('discover.pickupNear')}</Text>
        <Text style={styles.address} numberOfLines={SINGLE_LINE}>
          {label}
        </Text>
      </View>
      <Text style={styles.radius}>{km}</Text>
      <Icon name="chevronDown" color={chevronColor} />
    </Pressable>
  );
}
