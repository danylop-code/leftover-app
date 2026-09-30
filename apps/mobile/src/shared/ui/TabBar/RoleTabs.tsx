import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { customerTabs } from '../../constants/tabs';
import { RouterTabBar } from './RouterTabBar';

type Props = { tabs: typeof customerTabs };

const screenOptions = { headerShown: false };

/** expo-router <Tabs> with the design's tab bar, for a role's (tabs) layout. */
export function RoleTabs({ tabs }: Props) {
  const { t } = useTranslation();
  const config = Object.fromEntries(
    tabs.map((tab) => [tab.name, { label: t(tab.labelKey), icon: tab.icon }]),
  );
  return (
    <Tabs
      screenOptions={screenOptions}
      tabBar={(props) => <RouterTabBar {...props} tabs={config} />}
    />
  );
}
