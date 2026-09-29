import {
  color,
  elevation,
  fontFamily,
  fontStack,
  map,
  media,
  radius,
  shadows,
  space,
  tapMin,
  typography,
} from '.';
import { designRootCss as css } from './fixtures/design-root';
import { fontAssets } from './fonts';

const tokens = [...css.matchAll(/--([a-z0-9-]+):([^;]+);/g)].map(([, name, value]) => ({
  name: name as string,
  value: (value as string).trim(),
}));

const camel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const px = (v: string) => Number(v.replace('px', ''));
const norm = (v: string) => v.replace(/\s+/g, '').toLowerCase();

const prefixed = (prefix: string) =>
  tokens
    .filter((t) => t.name.startsWith(`${prefix}-`))
    .map((t) => ({ key: camel(t.name.slice(prefix.length + 1)), value: t.value }));

describe('theme parity with the design theme.css :root', () => {
  it('reads every token in the fixture', () => {
    // Guards the regex: a new or reshaped token in theme.css must show up here.
    expect(tokens).toHaveLength(75);
  });

  it.each(prefixed('color'))('color.$key', ({ key, value }) => {
    expect(norm(color[key as keyof typeof color])).toBe(norm(value));
  });

  it.each(prefixed('media'))('media.$key', ({ key, value }) => {
    expect(norm(media[key as keyof typeof media])).toBe(norm(value));
  });

  it.each(prefixed('map'))('map.$key', ({ key, value }) => {
    expect(norm(map[key as keyof typeof map])).toBe(norm(value));
  });

  it.each(prefixed('space'))('space[$key]', ({ key, value }) => {
    expect(space[Number(key) as keyof typeof space]).toBe(px(value));
  });

  it.each(prefixed('radius'))('radius.$key', ({ key, value }) => {
    expect(radius[key as keyof typeof radius]).toBe(px(value));
  });

  it.each(prefixed('elevation'))('elevation[$key]', ({ key, value }) => {
    const level = Number(key) as keyof typeof shadows;
    expect(norm(shadows[level])).toBe(norm(value));
    expect(elevation[level]).toBeDefined();
  });

  it.each(prefixed('font'))('fontStack.$key', ({ key, value }) => {
    expect(fontStack[key as keyof typeof fontStack]).toBe(value);
  });

  it.each(prefixed('text'))('typography.$key', ({ key, value }) => {
    const m = value.match(/^(\d+) (\d+)px\/(\d+)px var\(--font-(\w+)\)$/);
    expect(m).not.toBeNull();
    const [, weight, size, lineHeight, family] = m as RegExpMatchArray;
    const style = typography[key as keyof typeof typography];
    expect(style.fontSize).toBe(Number(size));
    expect(style.lineHeight).toBe(Number(lineHeight));
    const families = fontFamily[family as keyof typeof fontFamily] as Record<string, string>;
    expect(style.fontFamily).toBe(families[weight as string]);
  });

  it('tapMin', () => {
    expect(tapMin).toBe(px(tokens.find((t) => t.name === 'tap-min')?.value ?? ''));
  });
});

describe('native elevation', () => {
  it('is flat at level 0 and grows with level', () => {
    expect(elevation[0].elevation).toBe(0);
    expect(elevation[1].shadowRadius).toBeLessThan(elevation[2].shadowRadius);
    expect(elevation[2].shadowRadius).toBeLessThan(elevation[3].shadowRadius);
    expect(elevation[3].elevation).toBeGreaterThan(elevation[2].elevation);
  });

  it('derives from the largest css layer', () => {
    // --elevation-2 largest layer: 0 10px 24px rgba(29,42,34,.08)
    expect(elevation[2]).toMatchObject({
      shadowColor: 'rgb(29,42,34)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    });
  });
});

describe('fonts', () => {
  it('loads every family the theme references', () => {
    const families = [...Object.values(fontFamily.display), ...Object.values(fontFamily.body)];
    for (const f of families) expect(Object.keys(fontAssets)).toContain(f);
  });
});
