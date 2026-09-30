import { StyleSheet } from 'react-native';
import { color, typography } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  caption: { ...typography.caption, color: color.textSecondary },
  rated: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
