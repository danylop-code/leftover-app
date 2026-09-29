import { makeStyles, radius, space } from '../../../../shared/theme';

const ART = 112;

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  // PickupCollected artboard.
  const styles = sheet({
    root: { gap: space[5], paddingBottom: space[6] },
    hero: { alignItems: 'center', gap: 10, paddingTop: space[1] },
    art: {
      width: ART,
      height: ART,
      borderRadius: ART / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color.successSoft,
    },
    title: { ...typography.display, color: color.textPrimary, textAlign: 'center' },
    text: { ...typography.body, color: color.textSecondary, textAlign: 'center' },
    saved: {
      height: 32,
      paddingHorizontal: 14,
      borderRadius: radius.pill,
      justifyContent: 'center',
      backgroundColor: color.successSoft,
    },
    savedText: { fontFamily: fontFamily.body['700'], fontSize: 14, color: color.success },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingVertical: space[3],
      paddingHorizontal: space[4],
      borderRadius: radius.xl,
      backgroundColor: color.surfaceSunken,
    },
    summaryBody: { flex: 1 },
    summaryTitle: { ...typography.label, color: color.textPrimary },
    summaryCaption: { ...typography.caption, color: color.textSecondary },
    caption: { ...typography.caption, color: color.textSecondary, textAlign: 'center' },
    rateCard: {
      alignItems: 'center',
      gap: space[2],
      padding: space[5],
      borderRadius: radius.xl,
      backgroundColor: color.surface,
      ...elevation[1],
    },
    rateTitle: { ...typography.heading, color: color.textPrimary },
    rateAction: { alignSelf: 'stretch', marginTop: space[2] },
  });
  return { styles };
});
