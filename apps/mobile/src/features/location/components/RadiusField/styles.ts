import { StyleSheet } from 'react-native';
import { color, typography } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  root: { gap: 2 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { ...typography.label, color: color.textPrimary },
  value: { ...typography.title, color: color.primary },
  // `.range-scale`
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { ...typography.caption, color: color.textSecondary },
});
