import { makeStyles } from '../../theme';

export const useStyles = makeStyles(({ typography, sheet }) => {
  const styles = sheet(typography);
  return { styles };
});
