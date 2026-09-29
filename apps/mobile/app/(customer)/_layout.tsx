import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';

const screenOptions = { headerShown: false };

export default function CustomerLayout() {
  return (
    <RoleGate allow="customer">
      <Stack screenOptions={screenOptions} />
    </RoleGate>
  );
}
