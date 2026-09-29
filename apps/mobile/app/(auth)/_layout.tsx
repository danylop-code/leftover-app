import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';

const screenOptions = { headerShown: false };

export default function AuthLayout() {
  return (
    <RoleGate allow="guest">
      <Stack screenOptions={screenOptions} />
    </RoleGate>
  );
}
