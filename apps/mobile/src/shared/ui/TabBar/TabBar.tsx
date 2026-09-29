import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../icons';
import { MIN_BOTTOM_PADDING, styles, tint } from './styles';

export type TabItem = {
  key: string;
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
};

type Props = { items: readonly TabItem[] };

/** Bottom tab bar (`.tabbar`). Customer: Discover · Orders · Profile; store: Bags · Orders · Profile. */
export function TabBar({ items }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_PADDING) }]}
      accessibilityRole="tablist"
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.active }}
          onPress={item.onPress}
          style={styles.tab}
        >
          <View style={[styles.pill, item.active && styles.pillActive]}>
            <Icon name={item.icon} size="lg" color={item.active ? tint.active : tint.inactive} />
          </View>
          <Text style={[styles.label, item.active && styles.labelActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
