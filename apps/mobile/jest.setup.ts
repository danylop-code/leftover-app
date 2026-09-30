// Strings resolve exactly as in the app.
import './src/shared/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './src/shared/i18n';
import { useLocation } from './src/shared/store/location';
import { usePreferences } from './src/shared/store/preferences';
import { expoLocalizationMock } from './src/shared/testing/expo-localization-mock';
import { expoLocationMock } from './src/shared/testing/expo-location-mock';
import { secureStoreMock } from './src/shared/testing/secure-store-mock';

// Factories are hoisted above imports, so each mock is required inside its factory.
jest.mock(
  'expo-secure-store',
  () => require('./src/shared/testing/secure-store-mock').secureStoreMock,
);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock(
  'expo-location',
  () => require('./src/shared/testing/expo-location-mock').expoLocationMock,
);
jest.mock(
  'expo-localization',
  () => require('./src/shared/testing/expo-localization-mock').expoLocalizationMock,
);
jest.mock('@react-native-community/datetimepicker', () =>
  require('./src/shared/testing/datetimepicker-mock'),
);
jest.mock('react-native-maps', () => require('./src/shared/testing/react-native-maps-mock'));

beforeEach(async () => {
  secureStoreMock.__reset();
  expoLocationMock.__reset();
  expoLocalizationMock.__reset();
  await AsyncStorage.clear();
  useLocation.setState(useLocation.getInitialState(), true);
  // As the app's bootstrap does: the store only writes once it has loaded.
  await useLocation.persist.rehydrate();
  // English, following the (mocked, English) phone, unless a test chooses otherwise.
  usePreferences.setState({ language: null, appearance: 'system' });
  await i18n.changeLanguage('en');
});
