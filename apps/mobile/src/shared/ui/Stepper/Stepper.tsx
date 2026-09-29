import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '../icons';
import { buttonHitSlop, useStyles } from './styles';

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  decreaseLabel?: string;
  increaseLabel?: string;
};

type StepProps = { icon: IconName; label: string; disabled: boolean; onPress: () => void };

function StepButton({ icon, label, disabled, onPress }: StepProps) {
  const { iconColor, styles } = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={buttonHitSlop}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Icon name={icon} color={disabled ? iconColor.disabled : iconColor.enabled} />
    </Pressable>
  );
}

/** Integer stepper; each button disables at its bound so the value never leaves [min, max]. */
export function Stepper({ value, min, max, onChange, decreaseLabel, increaseLabel }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <View style={styles.root}>
      <StepButton
        icon="minus"
        label={decreaseLabel ?? t('ui.stepper.decrease')}
        disabled={atMin}
        onPress={() => onChange(Math.max(min, value - 1))}
      />
      <Text style={styles.value} accessibilityLiveRegion="polite">
        {value}
      </Text>
      <StepButton
        icon="plus"
        label={increaseLabel ?? t('ui.stepper.increase')}
        disabled={atMax}
        onPress={() => onChange(Math.min(max, value + 1))}
      />
    </View>
  );
}
