import { makeStyles } from '../../../../shared/theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    caption: { ...typography.caption, color: color.textSecondary },
    rated: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  });
  return { styles };
});
