import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Icon, type IconName } from '../icons';
import { labelColor, smHitSlop, styles } from './styles';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  block?: boolean;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  block,
  icon,
  loading,
  disabled,
  accessibilityHint,
}: Props) {
  // `danger` is the ghost button in red (`.btn-ghost.danger`).
  const look = variant === 'danger' ? 'ghost' : variant;
  const fg = disabled ? labelColor.disabled : labelColor[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={size === 'sm' ? smHitSlop : undefined}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        block && styles.block,
        styles[look],
        pressed && styles[`${look}Pressed`],
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} testID="button-spinner" />
      ) : (
        <>
          {icon ? <Icon name={icon} color={fg} /> : null}
          <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: fg }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
