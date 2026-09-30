import { layout, makeStyles, radius, space } from '../../theme';

/** Clears the home indicator (34 px on the artboards). */
export const barPadding = (insetBottom: number) => ({
  paddingBottom: Math.max(insetBottom, space[5]),
});

export const useStyles = makeStyles(({ color, elevation, sheet }) => {
  const styles = sheet({
    bar: {
      gap: space[3],
      paddingTop: space[4],
      paddingHorizontal: layout.screenMargin,
      backgroundColor: color.surface,
      borderTopStartRadius: radius.sheet,
      borderTopEndRadius: radius.sheet,
      ...elevation[3],
    },
  });

  return { styles };
});
