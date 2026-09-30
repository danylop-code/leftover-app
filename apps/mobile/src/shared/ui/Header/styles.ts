import { StyleSheet } from 'react-native';
import { color, space, tapMin, typography } from '../../theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    paddingHorizontal: space[2],
    paddingBottom: space[2],
  },
  title: { ...typography.heading, flex: 1, textAlign: 'center', color: color.textPrimary },
  spacer: { width: tapMin, height: tapMin },
  large: { gap: 2, paddingHorizontal: space[5], paddingTop: space[2], paddingBottom: space[3] },
  kicker: { ...typography.label, color: color.textSecondary },
  largeTitle: { ...typography.display, color: color.textPrimary },
});
