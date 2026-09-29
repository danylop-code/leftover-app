// No style file reads theme colors or fonts at module load (brief 19): they'd be stuck on the
// light scheme and the Latin faces. Styles come from `makeStyles((theme) => …)` instead.
// Jest provides it; the mobile tsconfig has no Node types (gotchas.md).
declare const __dirname: string;

type Fs = {
  readdirSync: (p: string, o: { recursive: true }) => string[];
  readFileSync: (p: string, e: 'utf8') => string;
};
const fs = jest.requireActual<Fs>('fs');

const SRC = `${__dirname}/../..`;
const APP = `${SRC}/../app`;
const THEMED = ['color', 'media', 'map', 'shadows', 'elevation', 'typography', 'fontFamily'];

const files = (root: string) =>
  fs
    .readdirSync(root, { recursive: true })
    .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.includes('theme/'))
    .map((f) => ({ path: f, text: fs.readFileSync(`${root}/${f}`, 'utf8') }));

describe('style files', () => {
  const all = [...files(SRC), ...files(APP)];

  it('import no themed tokens from the theme module', () => {
    const offenders = all.filter(({ text }) =>
      [...text.matchAll(/import \{([^}]*)\} from '[./]*(?:shared\/)?theme'/g)].some(([, names]) =>
        // Type-only imports (`type typography`) are fine: they don't read values.
        (names ?? '').split(',').some((n) => THEMED.includes(n.trim())),
      ),
    );
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  it('never call StyleSheet.create outside makeStyles', () => {
    const offenders = all.filter(
      ({ path, text }) => path.endsWith('styles.ts') && text.includes('StyleSheet.create('),
    );
    expect(offenders.map((f) => f.path)).toEqual([]);
  });
});
