import { StyleSheet } from 'react-native';
import { color, space, typography } from '../../../shared/theme';

// Settings artboard: `.content` gap 20.
export const styles = StyleSheet.create({
  content: { gap: space[5], paddingBottom: space[8] },
  version: { ...typography.caption, color: color.textSecondary, textAlign: 'center' },
});
