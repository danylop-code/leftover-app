import { layout, makeStyles, radius, space } from '../../../shared/theme';

export const useStyles = makeStyles(({ sheet }) => {
  const styles = sheet({
    segment: { paddingHorizontal: layout.screenMargin, paddingBottom: space[1] },
    list: {
      gap: space[3],
      paddingTop: space[3],
      paddingHorizontal: layout.screenMargin,
      paddingBottom: space[6],
    },
    skeleton: { height: 148, borderRadius: radius.xl },
    centered: { flex: 1, justifyContent: 'center' },
  });
  return { styles };
});
