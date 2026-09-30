import { ShopGate } from '../../../src/features/shop-setup/components/ShopGate/ShopGate';
import { storeTabs } from '../../../src/shared/constants/tabs';
import { RoleTabs } from '../../../src/shared/ui';

export default function StoreTabsLayout() {
  return (
    <ShopGate need="shop">
      <RoleTabs tabs={storeTabs} />
    </ShopGate>
  );
}
