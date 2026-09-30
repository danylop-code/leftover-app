import { makeStyles } from '../../theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    value: {
      fontFamily: typography.body.fontFamily,
      fontSize: typography.body.fontSize,
      color: color.textPrimary,
    },
    placeholder: {
      fontFamily: typography.body.fontFamily,
      fontSize: typography.body.fontSize,
      color: color.textSecondary,
    },
  });

  // Web: the DOM <input type="time"> blends into the kit field around it.
  const webInput = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: color.transparent,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: color.textPrimary,
  } as const;
  return { styles, webInput };
});
