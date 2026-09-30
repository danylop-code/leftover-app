import { makeStyles, radius, space } from '../../theme';

export const useStyles = makeStyles(({ color, elevation, typography, sheet }) => {
  const styles = sheet({
    root: { gap: space[2] },
    list: {
      backgroundColor: color.surface,
      borderRadius: radius.lg,
      overflow: 'hidden',
      ...elevation[1],
    },
    status: { ...typography.caption, color: color.textSecondary },
  });
  return { styles };
});
