import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { PREFERENCES_STORAGE_KEY, usePreferences } from './preferences';

describe('preferences store', () => {
  it('switches the app language when one is chosen', () => {
    usePreferences.getState().setLanguage('ar');
    expect(i18n.language).toBe('ar');
    expect(i18n.t('tabs.discover')).toBe('اكتشف');
    usePreferences.getState().setLanguage('en');
    expect(i18n.t('tabs.discover')).toBe('Discover');
  });

  it('keeps the choice across a restart', async () => {
    usePreferences.getState().setLanguage('ar');
    const saved = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    usePreferences.setState({ language: null });
    await i18n.changeLanguage('en');
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, saved ?? '');
    await usePreferences.persist.rehydrate();
    expect(usePreferences.getState().language).toBe('ar');
    expect(i18n.language).toBe('ar');
  });

  it('ignores a corrupt saved entry', async () => {
    await AsyncStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ state: { language: 'fr' }, version: 1 }),
    );
    await usePreferences.persist.rehydrate();
    expect(usePreferences.getState().language).toBeNull();
  });
});
