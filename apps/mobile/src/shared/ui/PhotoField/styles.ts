import { makeStyles, radius, space } from '../../theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    root: { gap: space[2] },
    label: { ...typography.label, color: color.textPrimary },
    row: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
    cover: { borderRadius: radius.lg },
    actions: { flex: 1, gap: space[2], alignItems: 'flex-start' },
    help: { ...typography.caption, color: color.textSecondary },
    error: { ...typography.caption, color: color.danger },
  });
  return { styles };
});
