import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    gap: space[3],
    padding: space[4],
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    ...elevation[1],
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  topBody: { flex: 1, minWidth: 0 },
  store: { ...typography.caption, color: color.textSecondary },
  item: { ...typography.heading, fontSize: 16, lineHeight: 22, color: color.textPrimary },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  metaText: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  sep: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: color.textSecondary },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  note: { ...typography.caption, color: color.textSecondary },
  total: {
    fontFamily: fontFamily.display['600'],
    fontSize: 20,
    lineHeight: 24,
    color: color.accent,
  },
  actions: { flexDirection: 'row', gap: space[2] },
});

export const metaIconColor = color.textSecondary;
