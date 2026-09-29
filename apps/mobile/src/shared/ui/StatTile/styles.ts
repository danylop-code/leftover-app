import { StyleSheet } from 'react-native';
import { color, space, typography } from '../../theme';

export const styles = StyleSheet.create({
  tile: { flex: 1, paddingVertical: space[3], paddingHorizontal: 14, borderRadius: 14 },
  value: { ...typography.title },
  label: { ...typography.caption },
});

export const tones = {
  primary: { bg: color.primarySoft, fg: color.primary },
  accent: { bg: color.accentSoft, fg: color.accentPressed },
} as const;
