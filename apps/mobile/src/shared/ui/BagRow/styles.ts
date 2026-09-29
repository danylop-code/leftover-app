import { makeStyles, radius, space } from '../../theme';

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  const styles = sheet({
    row: {
      flexDirection: 'row',
      gap: space[3],
      padding: space[3],
      backgroundColor: color.surface,
      borderRadius: radius.xl,
      ...elevation[1],
    },
    dimmed: { opacity: 0.62 },
    pressed: { opacity: 0.92 },
    body: { flex: 1, minWidth: 0, gap: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
    title: {
      ...typography.heading,
      fontSize: 16,
      lineHeight: 22,
      color: color.textPrimary,
      flex: 1,
    },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: {
      ...typography.label,
      fontFamily: fontFamily.body['500'],
      color: color.textSecondary,
    },
    foot: {
      marginTop: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
    },
  });

  const metaIconColor = color.textSecondary;
  return { styles, metaIconColor };
});
