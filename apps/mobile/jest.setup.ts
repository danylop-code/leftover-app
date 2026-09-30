// Strings resolve exactly as in the app.
import './src/shared/i18n';
import { secureStoreMock } from './src/shared/testing/secure-store-mock';

// Factories are hoisted above imports, so the mock is required inside.
jest.mock(
  'expo-secure-store',
  () => require('./src/shared/testing/secure-store-mock').secureStoreMock,
);

beforeEach(() => secureStoreMock.__reset());
