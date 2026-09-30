// Stand-in for expo-localization in Jest (registered in jest.setup.ts): an English phone unless a
// test sets another language.
let languageCode = 'en';

export const expoLocalizationMock = {
  getLocales: jest.fn(() => [{ languageCode, languageTag: languageCode }]),
  /** Test helper: the phone's language. */
  __setLanguage: (code: string) => {
    languageCode = code;
  },
  __reset: () => {
    languageCode = 'en';
  },
};
