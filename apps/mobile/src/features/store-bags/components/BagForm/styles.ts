import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../../shared/theme';

// AddBag artboard: form gap 24, paired fields, stepper and switch cards.
export const styles = StyleSheet.create({
  form: { gap: space[6], paddingTop: space[2], paddingBottom: space[8] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  group: { gap: 10 },
  pair: { flexDirection: 'row', gap: space[3] },
  half: { flex: 1 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: space[3],
    borderRadius: 14,
    backgroundColor: color.surface,
  },
  previewText: {
    ...typography.label,
    fontFamily: fontFamily.body['500'],
    color: color.textSecondary,
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
  cardText: { flex: 1 },
  cardLabel: { ...typography.label, fontSize: 15, color: color.textPrimary },
  caption: { ...typography.caption, color: color.textSecondary },
  error: { ...typography.caption, fontFamily: fontFamily.body['600'], color: color.danger },
  groupLabel: { ...typography.label, color: color.textPrimary },
  actions: { gap: space[1] },
});
