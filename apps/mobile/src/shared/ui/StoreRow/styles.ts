import { makeStyles, radius, space } from '../../theme';

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  const styles = sheet({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: 72,
      paddingVertical: space[3],
      paddingHorizontal: space[4],
      backgroundColor: color.surface,
      borderRadius: radius.lg,
      ...elevation[1],
    },
    pressed: { opacity: 0.92 },
    body: { flex: 1, minWidth: 0, gap: 2 },
    name: {
      fontFamily: fontFamily.body['700'],
      fontSize: 16,
      lineHeight: 22,
      color: color.textPrimary,
    },
    meta: { ...typography.caption, color: color.textSecondary },
  });

  const chevronColor = color.textSecondary;
  return { styles, chevronColor };
});
