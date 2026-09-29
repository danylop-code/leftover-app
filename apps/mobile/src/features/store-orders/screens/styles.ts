import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../shared/theme';

// StoreOrders artboard.
export const styles = StyleSheet.create({
  content: { gap: space[4], paddingBottom: space[8] },
  card: {
    gap: 14,
    paddingTop: 18,
    paddingHorizontal: space[4],
    paddingBottom: space[4],
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  heading: { ...typography.heading, color: color.textPrimary },
  help: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  error: {
    flex: 1,
    fontFamily: fontFamily.body['600'],
    fontSize: 13,
    lineHeight: 18,
    color: color.danger,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: space[1],
    paddingHorizontal: space[1],
  },
  count: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  list: { backgroundColor: color.surface, borderRadius: radius.xl, overflow: 'hidden' },
  skeleton: { height: 144, borderRadius: radius.xl },
  inlineError: { gap: space[2], alignItems: 'flex-start' },
});

export const errorIconColor = color.danger;
