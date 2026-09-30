import { makeStyles, space } from '../../../shared/theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    content: { gap: space[6], paddingBottom: space[10] },
    intro: { gap: 6 },
    title: { ...typography.display, color: color.textPrimary },
    body: { ...typography.body, color: color.textSecondary },
    form: { gap: space[5] },
    groupLabel: { ...typography.label, color: color.textPrimary },
    group: { gap: space[2] },
    status: { ...typography.caption, color: color.textSecondary },
    statusError: { ...typography.caption, color: color.danger },
    hours: { flexDirection: 'row', gap: space[3] },
    hour: { flex: 1 },
  });
  return { styles };
});
