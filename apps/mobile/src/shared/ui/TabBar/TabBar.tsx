import { Platform, Pressable, Text, View } from 'react-native';
import { useKeyboardVisible } from '../../lib/use-keyboard-visible';
import { Icon, type IconName } from '../icons';
import { styles, tint } from './styles';
import { useTabBarBottom } from './use-tab-bar-inset';

export type TabItem = {
  key: string;
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
};

type Props = { items: readonly TabItem[] };

/**
 * The floating tab bar (`.tabbar`): a compact centred island above the home indicator; the
 * active tab is filled. Customer: Discover · Orders · Profile; store: Bags · Orders ·
 * Profile. Hidden while the Android keyboard is open (it would ride up on top of it).
 */
export function TabBar({ items }: Props) {
  const bottom = useTabBarBottom();
  const keyboard = useKeyboardVisible();
  if (keyboard && Platform.OS === 'android') return null;
  return (
    <View style={[styles.dock, { bottom }]} pointerEvents="box-none" testID="tab-bar">
      <View style={styles.island} accessibilityRole="tablist">
        {items.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: item.active }}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.tab,
              item.active && styles.tabActive,
              pressed && !item.active && styles.pressed,
            ]}
          >
            <Icon name={item.icon} size="lg" color={item.active ? tint.active : tint.inactive} />
            <Text style={[styles.label, item.active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
