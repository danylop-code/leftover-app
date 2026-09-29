import { makeStyles, space } from '../../theme';

export const useStyles = makeStyles(({ color, fontFamily, typography, sheet }) => {
  // `.list-row` at `min-height: 64px` with a sunken `.row-ic` (LocationSearch artboard).
  const styles = sheet({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      minHeight: 64,
      paddingHorizontal: space[4],
      borderBottomWidth: 1,
      borderBottomColor: color.border,
    },
    last: { borderBottomWidth: 0 },
    pressed: { backgroundColor: color.surfaceSunken },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color.surfaceSunken,
    },
    text: { flex: 1, minWidth: 0 },
    label: { ...typography.body, color: color.textPrimary },
    match: { fontFamily: fontFamily.body['700'] },
    secondary: { ...typography.caption, color: color.textSecondary },
    distance: { ...typography.caption, color: color.textSecondary },
  });

  const iconColor = color.textSecondary;
  return { styles, iconColor };
});
