import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';
import { useScreenOptions } from '../../src/shared/ui';

export default function AuthLayout() {
  const screenOptions = useScreenOptions();
  return (
    <RoleGate allow="guest">
      <Stack screenOptions={screenOptions} />
    </RoleGate>
  );
}
