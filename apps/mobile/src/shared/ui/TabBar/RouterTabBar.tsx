import type { BottomTabBarProps } from 'expo-router/tabs';
import type { IconName } from '../icons';
import { TabBar } from './TabBar';

type Props = BottomTabBarProps & {
  /** Route name → label and icon. Routes not listed get no tab. */
  tabs: Record<string, { label: string; icon: IconName }>;
};

/** Adapts expo-router <Tabs> to the design's TabBar. */
export function RouterTabBar({ state, navigation, tabs }: Props) {
  const items = state.routes.flatMap((route, index) => {
    const tab = tabs[route.name];
    if (!tab) return [];
    const active = state.index === index;
    return [
      {
        key: route.key,
        label: tab.label,
        icon: tab.icon,
        active,
        onPress: () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        },
      },
    ];
  });
  return <TabBar items={items} />;
}
