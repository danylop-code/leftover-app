import { storeTabs } from '../../../src/shared/constants/tabs';
import { RoleTabs } from '../../../src/shared/ui';

export default function StoreTabsLayout() {
  return <RoleTabs tabs={storeTabs} />;
}
