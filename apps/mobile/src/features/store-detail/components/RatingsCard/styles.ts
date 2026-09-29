import { makeStyles, radius, space } from '../../../../shared/theme';

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  // `.card` with the 52 px display-font average beside the stars and count, then `.rbar`s.
  const styles = sheet({
    card: {
      gap: space[4],
      padding: space[5],
      borderRadius: radius.xl,
      backgroundColor: color.surface,
      ...elevation[1],
    },
    summary: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
    average: {
      fontFamily: fontFamily.display['600'],
      fontSize: 52,
      lineHeight: 52,
      color: color.primary,
    },
    side: { gap: space[1] },
    count: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
    bars: { gap: space[3] },
  });
  return { styles };
});
