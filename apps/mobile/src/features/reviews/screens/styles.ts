import { makeStyles, radius, space } from '../../../shared/theme';

export const useStyles = makeStyles(({ color, elevation, typography, sheet }) => {
  // Review artboard: `.content` gap 18.
  const styles = sheet({
    content: { gap: 18, paddingBottom: space[6] },
    bag: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    store: { ...typography.label, fontSize: 15, color: color.textPrimary },
    caption: { ...typography.caption, color: color.textSecondary },
    skeleton: { height: 44, borderRadius: radius.lg },
    overallCard: {
      alignItems: 'center',
      gap: 2,
      paddingVertical: space[4],
      paddingHorizontal: space[3],
      borderRadius: radius.xl,
      backgroundColor: color.surface,
      ...elevation[1],
    },
    heading: { ...typography.heading, color: color.textPrimary },
    word: { ...typography.label, color: color.primary },
    details: { gap: space[1] },
    detailsHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingHorizontal: space[1],
      paddingBottom: space[1],
    },
    detailsTitle: { ...typography.label, fontSize: 15, color: color.textPrimary },
    aspect: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingStart: space[1],
    },
    aspectName: { ...typography.body, fontSize: 15, color: color.textPrimary },
  });
  return { styles };
});
