import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../shared/theme';

const CLOCK = 44;

// Reserve artboard: `.content` gap 12, cards with 12–16 px padding.
export const styles = StyleSheet.create({
  content: { gap: space[3], paddingBottom: space[6] },
  loading: { gap: space[3] },
  skeletonRow: { height: 72, borderRadius: radius.lg },
  skeletonCard: { height: 64, borderRadius: radius.xl },
  centered: { flex: 1, justifyContent: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dimmed: { opacity: 0.55 },
  summaryBody: { flex: 1, gap: 2 },
  store: { ...typography.caption, color: color.textSecondary },
  bagTitle: { ...typography.heading, color: color.textPrimary },
  description: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: color.textSecondary,
    paddingTop: space[1],
    paddingHorizontal: space[1],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingLeft: space[4],
    paddingRight: space[3],
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  qtyText: { flex: 1, gap: space[1] },
  cardLabel: { ...typography.label, fontSize: 15, color: color.textPrimary },
  clock: {
    width: CLOCK,
    height: CLOCK,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  pickupText: { flex: 1 },
  caption: { ...typography.caption, color: color.textSecondary },
  pickupTime: { ...typography.heading, color: color.textPrimary },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  totalLabel: { ...typography.label, color: color.textPrimary },
  saving: { ...typography.caption, fontFamily: fontFamily.body['700'], color: color.success },
  others: { gap: 10, marginTop: space[2] },
  othersTitle: { ...typography.heading, color: color.textPrimary },
});

export const clockColor = color.primary;
