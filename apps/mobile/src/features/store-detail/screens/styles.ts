import { layout, makeStyles, radius, space } from '../../../shared/theme';

const LOGO_OVERLAP = 40;
export const STAR_SIZE = 16;

/** The back button sits just under the status bar (52 px on the artboard's 47 px inset). */
export const backPosition = (insetTop: number) => ({ top: insetTop + space[1] });

export const useStyles = makeStyles(({ color, fontFamily, typography, sheet }) => {
  // StoreDetail artboard: 240 px hero, then content (gap 28) with the 80 px logo overlapping it.
  const styles = sheet({
    root: { flex: 1, backgroundColor: color.background },
    scroll: { paddingBottom: space[10] },
    // Back on the left, the save heart on the right (Share is out of scope).
    heroBar: {
      position: 'absolute',
      start: space[3],
      end: space[3],
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toast: {
      position: 'absolute',
      start: layout.screenMargin,
      end: layout.screenMargin,
      bottom: space[8],
    },
    content: { gap: 28, paddingHorizontal: layout.screenMargin },
    logo: { position: 'absolute', start: layout.screenMargin, top: -LOGO_OVERLAP },
    intro: { gap: 6, paddingTop: 52 },
    name: { ...typography.display, color: color.textPrimary },
    facts: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    fact: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
    sep: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: color.textSecondary },
    rating: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    ratingValue: { ...typography.label, color: color.textPrimary },
    section: { gap: space[3] },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: space[3],
    },
    sectionTitle: { ...typography.title, color: color.textPrimary },
    sectionStatus: {
      ...typography.label,
      fontFamily: fontFamily.body['500'],
      color: color.textSecondary,
    },
    noBags: { ...typography.body, color: color.textSecondary },
    centered: { flex: 1, justifyContent: 'center' },
    loading: { gap: space[4], paddingHorizontal: layout.screenMargin },
    skeletonHero: { height: 240, borderRadius: radius.xl },
    skeletonTitle: { width: '70%', height: 32 },
    skeletonLine: { width: '50%', height: 16 },
  });

  return { styles };
});
