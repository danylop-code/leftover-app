import { StyleSheet } from 'react-native';
import { color, fontFamily, space, typography } from '../../../shared/theme';

// Report artboard: `.content` gap 18.
export const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: space[8] },
  intro: { ...typography.body, color: color.textSecondary },
  group: { gap: 6 },
  labelRow: { flexDirection: 'row', gap: space[1], alignItems: 'baseline' },
  label: { ...typography.label, color: color.textPrimary },
  optional: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  centered: { flex: 1, justifyContent: 'center' },
});
