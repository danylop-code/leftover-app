// Hermes may ship without `Intl.PluralRules`, and i18next then falls back to one/other for
// every language — wrong for Arabic's six forms. This fills the gap for the app's languages only
// (CLDR cardinal rules), and leaves a native implementation alone.

type Category = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

const PERCENT = 100;
const FEW_MIN = 3;
const FEW_MAX = 10;
const MANY_MIN = 11;
const MANY_MAX = 99;

const arabic = (n: number): Category => {
  if (!Number.isInteger(n)) return 'other';
  const mod = n % PERCENT;
  if (n === 0) return 'zero';
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  if (mod >= FEW_MIN && mod <= FEW_MAX) return 'few';
  if (mod >= MANY_MIN && mod <= MANY_MAX) return 'many';
  return 'other';
};

const english = (n: number): Category => (n === 1 ? 'one' : 'other');

const RULES: Record<string, { select: (n: number) => Category; categories: Category[] }> = {
  ar: { select: arabic, categories: ['zero', 'one', 'two', 'few', 'many', 'other'] },
  en: { select: english, categories: ['one', 'other'] },
};

/** A minimal cardinal `Intl.PluralRules` for `en` and `ar`. */
export class FallbackPluralRules {
  private readonly rule: (typeof RULES)[string];
  private readonly locale: string;

  constructor(locales?: string | string[]) {
    const tag = (Array.isArray(locales) ? locales[0] : locales) ?? 'en';
    const language = tag.split(/[-_]/)[0] ?? 'en';
    this.locale = RULES[language] ? language : 'en';
    this.rule = RULES[this.locale] ?? { select: english, categories: ['one', 'other'] };
  }

  select(n: number): Category {
    return this.rule.select(n);
  }

  resolvedOptions() {
    return { locale: this.locale, pluralCategories: this.rule.categories };
  }
}

export const installPluralRules = () => {
  if (typeof Intl === 'undefined' || typeof Intl.PluralRules === 'function') return;
  (Intl as { PluralRules: unknown }).PluralRules = FallbackPluralRules;
};
