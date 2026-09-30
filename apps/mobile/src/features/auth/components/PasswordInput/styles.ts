import { makeStyles } from '../../../../shared/theme';

export const useStyles = makeStyles(({ color }) => {
  const toggleColor = color.textSecondary;
  return { toggleColor };
});
