import { makeStyles, radius, space } from '../../../../shared/theme';

export const useStyles = makeStyles(({ color, elevation, typography, sheet }) => {
  // StoreBags artboard: a `.card` row with 64 px media and the live switch.
  const styles = sheet({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingVertical: space[3],
      paddingStart: space[3],
      paddingEnd: space[4],
      borderRadius: radius.xl,
      backgroundColor: color.surface,
      ...elevation[1],
    },
    main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[3] },
    pressed: { opacity: 0.8 },
    paused: { opacity: 0.55 },
    body: { flex: 1, minWidth: 0, gap: space[1] },
    title: { ...typography.label, fontSize: 15, color: color.textPrimary },
    facts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  });
  return { styles };
});
