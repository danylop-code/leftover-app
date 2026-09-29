import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import type { iconSize } from '../../theme';
import { Icon, type IconName } from '../icons';
import { iconColor, smHitSlop, styles } from './styles';

type Props = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  variant?: 'plain' | 'filled' | 'tonal';
  size?: 'md' | 'sm';
  iconSize?: keyof typeof iconSize;
  color?: string;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'plain',
  size = 'md',
  iconSize: glyphSize = 'lg',
  color,
  selected,
  disabled,
  style,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled), selected }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={size === 'sm' ? smHitSlop : undefined}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon name={icon} size={glyphSize} color={color ?? iconColor[variant]} />
    </Pressable>
  );
}
