import { makeStyles, radius, space } from '../../theme';

const fav = 40;
const logoOverlap = 24;

export const STAR_SIZE = 16;

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  const styles = sheet({
    card: { backgroundColor: color.surface, borderRadius: radius.xl, ...elevation[1] },
    clip: { borderRadius: radius.xl, overflow: 'hidden' },
    pressed: { opacity: 0.92 },
    stock: { position: 'absolute', start: space[3], top: space[3] },
    fav: { position: 'absolute', end: 10, top: 10 },
    favSize: { width: fav, height: fav },
    body: { gap: 2, paddingTop: 30, paddingHorizontal: space[4], paddingBottom: space[4] },
    logo: { position: 'absolute', start: space[4], top: -logoOverlap },
    store: { ...typography.caption, color: color.textSecondary },
    title: { ...typography.heading, color: color.textPrimary },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    metaText: {
      ...typography.label,
      fontFamily: fontFamily.body['500'],
      color: color.textSecondary,
    },
    foot: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: space[3],
      marginTop: 10,
    },
    facts: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    fact: { ...typography.label, color: color.textPrimary },
    rating: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    sep: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: color.textSecondary },
  });

  const metaIconColor = color.textSecondary;
  return { styles, metaIconColor };
});
