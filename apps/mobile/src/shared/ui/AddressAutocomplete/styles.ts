import { StyleSheet } from 'react-native';
import { color, elevation, radius, space, typography } from '../../theme';

export const styles = StyleSheet.create({
  root: { gap: space[2] },
  list: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation[1],
  },
  status: { ...typography.caption, color: color.textSecondary },
});
