import { makeStyles } from '../../theme';

export const sizes = { md: 44, lg: 64, xl: 80 } as const;

export const useStyles = makeStyles(({ color, scriptFonts, sheet }) => {
  const styles = sheet({
    root: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    md: { width: sizes.md, height: sizes.md, borderRadius: sizes.md / 2 },
    lg: { width: sizes.lg, height: sizes.lg, borderRadius: sizes.lg / 2 },
    // StoreDetail: 80 px, ringed in the page background where it overlaps the hero.
    xl: {
      width: sizes.xl,
      height: sizes.xl,
      borderRadius: sizes.xl / 2,
      borderWidth: 4,
      borderColor: color.background,
    },
    ring: { borderWidth: 3, borderColor: color.surface },
    letter: { color: color.onPrimary, textAlign: 'center', includeFontPadding: false },
    latin: { fontFamily: scriptFonts.latin.display['600italic'] },
    arabic: { fontFamily: scriptFonts.arabic.display['600'] },
    letterMd: { fontSize: 18, lineHeight: 22 },
    letterLg: { fontSize: 26, lineHeight: 30 },
    letterXl: { fontSize: 34, lineHeight: 40 },
  });
  return { styles };
});
