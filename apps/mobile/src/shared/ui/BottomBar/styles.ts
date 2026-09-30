import { StyleSheet } from 'react-native';
import { color, elevation, layout, radius, space } from '../../theme';

export const styles = StyleSheet.create({
  bar: {
    gap: space[3],
    paddingTop: space[4],
    paddingHorizontal: layout.screenMargin,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    ...elevation[3],
  },
});

/** Clears the home indicator (34 px on the artboards). */
export const barPadding = (insetBottom: number) => ({
  paddingBottom: Math.max(insetBottom, space[5]),
});
