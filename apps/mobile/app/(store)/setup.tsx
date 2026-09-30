import { ShopGate } from '../../src/features/shop-setup/components/ShopGate/ShopGate';
import { ShopSetupScreen } from '../../src/features/shop-setup/screens/ShopSetupScreen';

export default function SetupRoute() {
  return (
    <ShopGate need="noShop">
      <ShopSetupScreen />
    </ShopGate>
  );
}
