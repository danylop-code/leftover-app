import { StyleSheet } from 'react-native';
import { layout, makeStyles, radius, space } from '../../theme';

/** Clears the home indicator (34 px on the artboards). */
export const sheetPadding = (insetBottom: number) => ({
  paddingBottom: Math.max(insetBottom, space[5]),
});

export const useStyles = makeStyles(({ color, elevation, typography, sheet }) => {
  // `.sheet` + `.sheet-grab` over the `--color-scrim` backdrop.
  const styles = sheet({
    root: { flex: 1, justifyContent: 'flex-end' },
    scrim: { ...StyleSheet.absoluteFill, backgroundColor: color.scrim },
    sheet: {
      gap: space[3],
      paddingTop: 10,
      paddingHorizontal: layout.screenMargin,
      backgroundColor: color.surface,
      borderTopStartRadius: radius.sheet,
      borderTopEndRadius: radius.sheet,
      ...elevation[3],
    },
    grab: {
      width: 40,
      height: 5,
      borderRadius: radius.pill,
      backgroundColor: color.border,
      alignSelf: 'center',
      marginBottom: space[1],
    },
    title: { ...typography.title, color: color.textPrimary },
    text: { ...typography.body, color: color.textSecondary },
    actions: { gap: space[2], marginTop: space[2] },
  });

  return { styles };
});
