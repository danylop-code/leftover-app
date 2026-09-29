import { StyleSheet } from 'react-native';
import { color, elevation, radius, space, typography } from '../../../../shared/theme';

// StoreBags artboard: a `.card` row with 64 px media and the live switch.
export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingLeft: space[3],
    paddingRight: space[4],
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
