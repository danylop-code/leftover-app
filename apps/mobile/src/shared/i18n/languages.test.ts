import { expoLocalizationMock } from '../testing/expo-localization-mock';
import { deviceLanguage, directionOf } from './languages';
import { effectiveLanguage } from './use-language';

describe('device language', () => {
  it('starts in Arabic on a phone set to Arabic (fresh install, nothing chosen)', () => {
    expoLocalizationMock.__setLanguage('ar');
    expect(deviceLanguage()).toBe('ar');
    expect(effectiveLanguage(null)).toBe('ar');
    expect(directionOf('ar')).toBe('rtl');
  });

  it('falls back to English for languages the app does not have', () => {
    expoLocalizationMock.__setLanguage('uk');
    expect(deviceLanguage()).toBe('en');
  });

  it('lets a choice made in Profile win over the phone', () => {
    expoLocalizationMock.__setLanguage('ar');
    expect(effectiveLanguage('en')).toBe('en');
  });
});
