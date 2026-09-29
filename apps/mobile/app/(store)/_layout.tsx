import { Stack } from 'expo-router';
import { RoleGate } from '../../src/features/auth/components/RoleGate/RoleGate';

const screenOptions = { headerShown: false };
const modal = { presentation: 'modal' } as const;

export default function StoreLayout() {
  return (
    <RoleGate allow="store">
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="bag/new" options={modal} />
        <Stack.Screen name="bag/[id]" options={modal} />
      </Stack>
    </RoleGate>
  );
}
