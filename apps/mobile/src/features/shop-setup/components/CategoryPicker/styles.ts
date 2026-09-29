import { makeStyles, space } from '../../../../shared/theme';

export const useStyles = makeStyles(({ sheet }) => {
  const styles = sheet({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  });
  return { styles };
});
