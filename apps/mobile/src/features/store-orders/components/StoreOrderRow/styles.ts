import { makeStyles, space } from '../../../../shared/theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  // `.list-row` at min-height 72.
  const styles = sheet({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      minHeight: 72,
      paddingHorizontal: space[4],
      borderBottomWidth: 1,
      borderBottomColor: color.border,
    },
    last: { borderBottomWidth: 0 },
    body: { flex: 1 },
    name: { ...typography.label, fontSize: 15, color: color.textPrimary },
    muted: { color: color.textSecondary },
    caption: { ...typography.caption, color: color.textSecondary },
    side: { alignItems: 'flex-end', gap: space[1] },
    amount: { ...typography.label, color: color.textPrimary },
  });
  return { styles };
});
