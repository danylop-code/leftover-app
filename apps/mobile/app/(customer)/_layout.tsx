import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';

const screenOptions = { headerShown: false };
const modal = { presentation: 'modal' } as const;

export default function CustomerLayout() {
  return (
    <RoleGate allow="customer">
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="reserve/[bagId]" options={modal} />
        <Stack.Screen name="review/[orderId]" options={modal} />
      </Stack>
    </RoleGate>
  );
}
