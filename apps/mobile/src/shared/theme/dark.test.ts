import { color, darkColor, darkMedia, darkShadows, media, shadows } from '.';
import { designDarkCss } from './fixtures/design-dark';
import { designRootCss } from './fixtures/design-root';

const tokensOf = (css: string) =>
  [...css.matchAll(/--([a-z0-9-]+):([^;]+);/g)].map(([, name, value]) => ({
    name: name as string,
    value: (value as string).trim(),
  }));
const camel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const norm = (v: string) => v.replace(/\s+/g, '').toLowerCase();

const dark = tokensOf(designDarkCss);
const prefixed = (prefix: string) =>
  dark
    .filter((t) => t.name.startsWith(`${prefix}-`))
    .map((t) => ({ key: camel(t.name.slice(prefix.length + 1)), value: t.value }));

describe('dark theme parity with the proposed theme.css dark block (brief 19)', () => {
  it('has a dark value for every light color, media and elevation token', () => {
    const light = tokensOf(designRootCss)
      .map((t) => t.name)
      .filter((n) => /^(color|media|elevation)-/.test(n));
    expect(dark.map((t) => t.name).sort()).toEqual(light.sort());
  });

  it.each(prefixed('color'))('darkColor.$key', ({ key, value }) => {
    expect(norm(darkColor[key as keyof typeof darkColor])).toBe(norm(value));
  });

  it.each(prefixed('media'))('darkMedia.$key', ({ key, value }) => {
    expect(norm(darkMedia[key as keyof typeof darkMedia])).toBe(norm(value));
  });

  it.each(prefixed('elevation'))('darkShadows[$key]', ({ key, value }) => {
    expect(norm(darkShadows[Number(key) as keyof typeof darkShadows])).toBe(norm(value));
  });

  it('keeps the same keys as the light palette', () => {
    expect(Object.keys(darkColor).sort()).toEqual(Object.keys(color).sort());
    expect(Object.keys(darkMedia).sort()).toEqual(Object.keys(media).sort());
    expect(Object.keys(darkShadows)).toEqual(Object.keys(shadows));
  });
});
