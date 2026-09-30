import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useBootstrapSession } from '../src/features/auth/hooks/use-bootstrap-session';
import { createQueryClient } from '../src/shared/api/query-client';
import '../src/shared/i18n';
import { fontAssets } from '../src/shared/theme/fonts';
import { AppFrame } from '../src/shared/ui';

SplashScreen.preventAutoHideAsync();

const screenOptions = { headerShown: false };

// Holds the splash until fonts are loaded and the stored session has been read, so the first
// frame is already the right screen (Welcome or the role's home).
function AppStack() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const sessionReady = useBootstrapSession();
  const ready = (fontsLoaded || Boolean(fontError)) && sessionReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return (
    <AppFrame>
      <Stack screenOptions={screenOptions} />
    </AppFrame>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <AppStack />
    </QueryClientProvider>
  );
}
