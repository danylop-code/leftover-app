import { customerTabs } from '../../../src/shared/constants/tabs';
import { RoleTabs } from '../../../src/shared/ui';

export default function CustomerTabsLayout() {
  return <RoleTabs tabs={customerTabs} />;
}
