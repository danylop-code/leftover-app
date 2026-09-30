import { StyleSheet } from 'react-native';
import { color, fontFamily, radius, space, typography } from '../../theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  name: {
    ...typography.label,
    fontFamily: fontFamily.body['500'],
    color: color.textSecondary,
    width: 112,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceSunken,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: color.primary },
  value: { ...typography.label, color: color.textPrimary, width: 28, textAlign: 'right' },
});
