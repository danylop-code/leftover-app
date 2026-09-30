import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import {
  RADIUS_MAX_KM,
  RADIUS_MIN_KM,
  RADIUS_STEP_KM,
} from '../../../../shared/constants/location';
import { Slider } from '../../../../shared/ui';
import { styles } from './styles';

type Props = { value: number; onChange: (km: number) => void };

/** "Search radius" label + value, the 1–30 km slider and its scale. */
export function RadiusField({ value, onChange }: Props) {
  const { t } = useTranslation();
  const valueText = t('format.km', { value });
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.label}>{t('location.radius')}</Text>
        <Text style={styles.value}>{valueText}</Text>
      </View>
      <Slider
        value={value}
        min={RADIUS_MIN_KM}
        max={RADIUS_MAX_KM}
        step={RADIUS_STEP_KM}
        onChange={onChange}
        label={t('location.radius')}
        valueText={valueText}
      />
      <View style={styles.scale} importantForAccessibility="no-hide-descendants">
        <Text style={styles.scaleText} accessibilityElementsHidden>
          {t('format.km', { value: RADIUS_MIN_KM })}
        </Text>
        <Text style={styles.scaleText} accessibilityElementsHidden>
          {t('format.km', { value: RADIUS_MAX_KM })}
        </Text>
      </View>
    </View>
  );
}
