import { makeStyles, radius, space } from '../../theme';

export const useStyles = makeStyles(({ color, fontFamily, typography, sheet }) => {
  const styles = sheet({
    row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    name: {
      ...typography.label,
      fontFamily: fontFamily.body['500'],
      color: color.textSecondary,
      width: 112,
    },
    track: {
      flex: 1,
      height: 8,
      borderRadius: radius.pill,
      backgroundColor: color.surfaceSunken,
      overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: color.primary },
    value: { ...typography.label, color: color.textPrimary, width: 28, textAlign: 'right' },
  });
  return { styles };
});
