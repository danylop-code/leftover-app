import { layout, makeStyles, radius, space } from '../../../shared/theme';

export const useStyles = makeStyles(({ color, elevation, sheet }) => {
  const styles = sheet({
    list: { gap: space[3], paddingTop: space[3], paddingHorizontal: layout.screenMargin },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingEnd: space[3],
      borderRadius: radius.xl,
      backgroundColor: color.surface,
      ...elevation[1],
    },
    row: { flex: 1, minWidth: 0 },
    skeleton: { height: 72, borderRadius: radius.xl },
    centered: { flex: 1, justifyContent: 'center' },
    toast: { position: 'absolute', start: layout.screenMargin, end: layout.screenMargin },
  });
  return { styles };
});
