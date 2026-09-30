import { makeStyles, radius, space, tapMin } from '../../theme';

const DOT = 22;

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    list: { backgroundColor: color.surface, borderRadius: radius.xl, overflow: 'hidden' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: tapMin,
      paddingVertical: space[2],
      paddingHorizontal: space[4],
      borderBottomWidth: 1,
      borderBottomColor: color.border,
    },
    last: { borderBottomWidth: 0 },
    pressed: { backgroundColor: color.surfaceSunken },
    dot: {
      width: DOT,
      height: DOT,
      borderRadius: DOT / 2,
      borderWidth: 1.5,
      borderColor: color.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotOn: { backgroundColor: color.primary, borderColor: color.primary },
    label: { ...typography.body, flex: 1, color: color.textPrimary },
  });

  const checkColor = color.onPrimary;
  return { styles, checkColor };
});
