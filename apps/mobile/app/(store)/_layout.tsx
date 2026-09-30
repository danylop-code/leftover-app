import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';
import { useScreenOptions } from '../../src/shared/ui';

const modal = { presentation: 'modal' } as const;

export default function StoreLayout() {
  const screenOptions = useScreenOptions();
  return (
    <RoleGate allow="store">
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="bag/new" options={modal} />
        <Stack.Screen name="bag/[id]" options={modal} />
      </Stack>
    </RoleGate>
  );
}
