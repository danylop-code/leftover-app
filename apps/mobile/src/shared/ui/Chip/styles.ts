import { hitSlopFor, makeStyles, radius, space } from '../../theme';

const height = 40;
export const chipHitSlop = hitSlopFor(height);

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height,
      paddingHorizontal: space[4],
      borderRadius: radius.pill,
      backgroundColor: color.surface,
      borderWidth: 1,
      borderColor: color.border,
    },
    selected: { backgroundColor: color.primary, borderColor: color.primary },
    pressed: { opacity: 0.8 },
    label: { ...typography.label, color: color.textPrimary },
    labelSelected: { color: color.onPrimary },
    row: { gap: space[2], paddingHorizontal: space[5] },
  });
  return { styles };
});
