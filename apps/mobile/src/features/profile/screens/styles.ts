import { makeStyles, space } from '../../../shared/theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  // Settings artboard: `.content` gap 20.
  const styles = sheet({
    content: { gap: space[5], paddingBottom: space[8] },
    version: { ...typography.caption, color: color.textSecondary, textAlign: 'center' },
  });
  return { styles };
});
