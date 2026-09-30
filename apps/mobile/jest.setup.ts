// Strings resolve exactly as in the app.
import './src/shared/i18n';
import { secureStoreMock } from './src/shared/testing/secure-store-mock';

// Factories are hoisted above imports, so each mock is required inside its factory.
jest.mock(
  'expo-secure-store',
  () => require('./src/shared/testing/secure-store-mock').secureStoreMock,
);
jest.mock('react-native-maps', () => require('./src/shared/testing/react-native-maps-mock'));

beforeEach(() => secureStoreMock.__reset());
