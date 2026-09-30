import { stripBidi } from '../testing/bidi';
import i18n from '.';
import { FallbackPluralRules } from './plural-rules';

describe('Arabic plural rules', () => {
  it.each([
    [0, 'zero'],
    [1, 'one'],
    [2, 'two'],
    [3, 'few'],
    [10, 'few'],
    [11, 'many'],
    [99, 'many'],
    [100, 'other'],
    [103, 'few'],
  ])('the fallback puts %p in %p', (n, form) => {
    expect(new FallbackPluralRules('ar').select(n)).toBe(form);
  });

  it('agrees with the runtime where it has Intl.PluralRules', () => {
    const native = new Intl.PluralRules('ar');
    for (const n of [0, 1, 2, 5, 11, 100, 102]) {
      expect(new FallbackPluralRules('ar').select(n)).toBe(native.select(n));
    }
  });

  it('picks the Arabic forms for counts like 2 and 11 bags', async () => {
    await i18n.changeLanguage('ar');
    expect(i18n.t('discover.count', { count: 2 })).toBe('كيسان');
    expect(stripBidi(i18n.t('discover.count', { count: 3 }))).toBe('3 أكياس');
    expect(stripBidi(i18n.t('discover.count', { count: 11 }))).toBe('11 كيسًا');
    expect(stripBidi(i18n.t('discover.count', { count: 100 }))).toBe('100 كيس');
    await i18n.changeLanguage('en');
    expect(i18n.t('discover.count', { count: 2 })).toBe('2 bags');
  });
});
