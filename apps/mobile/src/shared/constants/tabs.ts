import type { IconName } from '../ui/icons';

type TabConfig = {
  name: string;
  labelKey: 'tabs.discover' | 'tabs.saved' | 'tabs.orders' | 'tabs.profile' | 'tabs.bags';
  icon: IconName;
};

// Route names are unique across groups: groups don't appear in URLs, so the store tabs can't
// reuse `orders`/`profile`.
export const customerTabs: readonly TabConfig[] = [
  { name: 'discover', labelKey: 'tabs.discover', icon: 'discover' },
  { name: 'saved', labelKey: 'tabs.saved', icon: 'heart' },
  { name: 'orders', labelKey: 'tabs.orders', icon: 'orders' },
  { name: 'profile', labelKey: 'tabs.profile', icon: 'profile' },
];

export const storeTabs: readonly TabConfig[] = [
  { name: 'bags', labelKey: 'tabs.bags', icon: 'bag' },
  { name: 'store-orders', labelKey: 'tabs.orders', icon: 'orders' },
  { name: 'store-profile', labelKey: 'tabs.profile', icon: 'profile' },
];
