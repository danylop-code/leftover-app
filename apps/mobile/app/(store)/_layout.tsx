import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';

const screenOptions = { headerShown: false };

export default function StoreLayout() {
  return (
    <RoleGate allow="store">
      <Stack screenOptions={screenOptions} />
    </RoleGate>
  );
}
