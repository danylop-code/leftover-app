import { StyleSheet } from 'react-native';
import { color, fontFamily, radius, space, typography } from '../../../shared/theme';

// Pickup artboard: `.content` gap 16; Cancel sits at the bottom with its note.
export const styles = StyleSheet.create({
  content: { gap: space[4], paddingBottom: space[8] },
  loading: { gap: space[4] },
  skeletonTicket: { height: 260, borderRadius: radius.xl },
  skeletonCard: { height: 96, borderRadius: radius.xl },
  centered: { flex: 1, justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caption: { ...typography.caption, color: color.textSecondary },
  center: { textAlign: 'center' },
  summary: {
    ...typography.label,
    fontFamily: fontFamily.body['500'],
    color: color.textSecondary,
    textAlign: 'center',
  },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  storeText: { flex: 1, minWidth: 0 },
  storeName: { ...typography.label, fontSize: 15, color: color.textPrimary },
  cancel: { alignItems: 'center', gap: 2, marginTop: space[4] },
});
