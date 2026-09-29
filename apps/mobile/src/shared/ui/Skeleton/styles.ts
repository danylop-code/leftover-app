import { makeStyles } from '../../theme';

export const useStyles = makeStyles(({ color, sheet }) => {
  const styles = sheet({
    block: { backgroundColor: color.surfaceSunken, borderRadius: 6 },
  });
  return { styles };
});
