import { LocationGate } from '../../../src/features/location/components/LocationGate/LocationGate';
import { customerTabs } from '../../../src/shared/constants/tabs';
import { RoleTabs } from '../../../src/shared/ui';

export default function CustomerTabsLayout() {
  return (
    <LocationGate>
      <RoleTabs tabs={customerTabs} />
    </LocationGate>
  );
}
