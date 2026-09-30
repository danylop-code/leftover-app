import { layout, makeStyles } from '../../theme';

export const useStyles = makeStyles(({ color, sheet }) => {
  const styles = sheet({
    root: { flex: 1, backgroundColor: color.background },
    padded: { paddingHorizontal: layout.screenMargin },
    scroll: { flexGrow: 1, gap: layout.cardGap },
  });
  return { styles };
});
