import ar from './locales/ar.json';
import en from './locales/en.json';

type Tree = { [key: string]: string | Tree };

const flatten = (tree: Tree, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([k, v]) =>
    typeof v === 'string' ? [`${prefix}${k}`] : flatten(v, `${prefix}${k}.`),
  );

const PLURAL = /_(zero|one|two|few|many|other)$/;
const base = (key: string) => key.replace(PLURAL, '');
const ARABIC_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

const enKeys = flatten(en);
const arKeys = flatten(ar);

describe('locale parity (brief 21)', () => {
  it('has an Arabic string for every English key, and nothing extra', () => {
    expect([...new Set(arKeys.map(base))].sort()).toEqual([...new Set(enKeys.map(base))].sort());
  });

  it('gives every Arabic plural all six forms', () => {
    const plurals = [...new Set(arKeys.filter((k) => PLURAL.test(k)).map(base))];
    for (const key of plurals) {
      for (const form of ARABIC_FORMS) expect(arKeys).toContain(`${key}_${form}`);
    }
  });

  it('keeps every English placeholder in the Arabic string', () => {
    const lookup = (tree: Tree, key: string) =>
      key
        .split('.')
        .reduce<Tree | string | undefined>(
          (node, part) => (typeof node === 'object' ? node[part] : undefined),
          tree,
        );
    const vars = (s: unknown) => [...String(s).matchAll(/{{(\w+)}}/g)].map((m) => m[1]).sort();
    for (const key of enKeys) {
      if (PLURAL.test(key)) continue;
      const arabic = lookup(ar, key);
      if (arabic === undefined) continue;
      expect({ key, vars: vars(arabic) }).toEqual({ key, vars: vars(lookup(en, key)) });
    }
  });
});
