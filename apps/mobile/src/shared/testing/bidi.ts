// Arabic strings carry invisible bidi isolates (brief 22, `shared/i18n/bidi.ts`). Assertions about
// the words compare without them; the isolates themselves are tested in `bidi.test.ts`/`format.test.ts`.
const CONTROLS = /[\u202A-\u202E\u2066-\u2069]/g;

export const stripBidi = (text: string): string => text.replace(CONTROLS, '');

/** A role name that ignores bidi controls: `getByRole('button', { name: bidiName('…') })`. */
export const bidiName = (expected: string): RegExp => {
  const optional = `${CONTROLS.source}*`;
  const chars = [...expected].map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^${optional}${chars.join(optional)}${optional}$`);
};
