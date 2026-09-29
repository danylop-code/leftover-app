import { makeStyles, radius, space } from '../../../../shared/theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    group: { gap: space[2] },
    label: {
      ...typography.caption,
      letterSpacing: 0.72,
      textTransform: 'uppercase',
      color: color.textSecondary,
      paddingHorizontal: space[1],
    },
    card: {
      gap: space[5],
      padding: space[4],
      backgroundColor: color.surface,
      borderRadius: radius.xl,
    },
  });
  return { styles };
});
