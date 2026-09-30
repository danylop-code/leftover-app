import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const testSafeArea = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// Infinite gcTime: no garbage-collection timers left running after a test (they keep Jest alive).
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false, gcTime: Number.POSITIVE_INFINITY },
    },
  });

/** Renders with a fresh QueryClient and safe-area metrics, as the app root provides them. */
export const renderWithProviders = (ui: ReactElement, queryClient = createTestQueryClient()) => ({
  queryClient,
  ...render(
    <SafeAreaProvider initialMetrics={testSafeArea}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  ),
});
