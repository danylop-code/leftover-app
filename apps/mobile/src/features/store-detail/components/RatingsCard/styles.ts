import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../../shared/theme';

// `.card` with the 52 px display-font average beside the stars and count, then `.rbar`s.
export const styles = StyleSheet.create({
  card: {
    gap: space[4],
    padding: space[5],
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  summary: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  average: {
    fontFamily: fontFamily.display['600'],
    fontSize: 52,
    lineHeight: 52,
    color: color.primary,
  },
  side: { gap: space[1] },
  count: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  bars: { gap: space[3] },
});
