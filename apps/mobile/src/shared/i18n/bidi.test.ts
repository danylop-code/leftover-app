import { formatTimeRange, formatWindow } from '../lib/format';
import i18n from '.';
import { isArabicScript, isolate, isolateIn } from './bidi';

const FSI = '\u2068';
const LRI = '\u2066';
const PDI = '\u2069';

describe('bidi (brief 22)', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('isolates a run, and only in right-to-left for text on its own', () => {
    expect(isolate('counter.')).toBe(`${FSI}counter.${PDI}`);
    expect(isolateIn('rtl', 'counter.')).toBe(`${FSI}counter.${PDI}`);
    expect(isolateIn('ltr', 'counter.')).toBe('counter.');
  });

  it('tells Arabic initials from Latin ones', () => {
    expect(isArabicScript('م')).toBe(true);
    expect(isArabicScript('Q')).toBe(false);
  });

  it('isolates interpolated values in Arabic and leaves English untouched', async () => {
    expect(i18n.t('format.km', { value: '1.9' })).toBe('1.9\u00a0km');
    await i18n.changeLanguage('ar');
    expect(i18n.t('format.km', { value: '1.9' })).toBe(`${FSI}1.9${PDI}\u00a0كم`);
  });

  it('keeps Arabic time ranges left-to-right so 12:42–13:42 never flips', async () => {
    const start = '2026-09-30T08:42:00Z';
    const end = '2026-09-30T09:42:00Z';
    expect(formatTimeRange(start, end, 'Asia/Muscat')).toBe('12:42–13:42');
    await i18n.changeLanguage('ar');
    const range = formatTimeRange(start, end, 'Asia/Muscat');
    expect(range.startsWith(LRI) && range.endsWith(PDI)).toBe(true);
    const window = formatWindow(start, end, 'Asia/Muscat', new Date(start));
    expect(window).toContain(`${LRI}${FSI}12:42${PDI}–${FSI}13:42${PDI}${PDI}`);
  });
});
