import { StyleSheet } from 'react-native';
import { color, elevation, layout, radius, space, typography } from '../../theme';

// `.sheet` + `.sheet-grab` over the `--color-scrim` backdrop.
export const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: color.scrim },
  sheet: {
    gap: space[3],
    paddingTop: 10,
    paddingHorizontal: layout.screenMargin,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
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

/** Clears the home indicator (34 px on the artboards). */
export const sheetPadding = (insetBottom: number) => ({
  paddingBottom: Math.max(insetBottom, space[5]),
});
