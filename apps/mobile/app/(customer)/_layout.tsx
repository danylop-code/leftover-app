import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';
import { useScreenOptions } from '../../src/shared/ui';

const modal = { presentation: 'modal' } as const;

export default function CustomerLayout() {
  const screenOptions = useScreenOptions();
  return (
    <RoleGate allow="customer">
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="reserve/[bagId]" options={modal} />
        <Stack.Screen name="review/[orderId]" options={modal} />
      </Stack>
    </RoleGate>
  );
}
