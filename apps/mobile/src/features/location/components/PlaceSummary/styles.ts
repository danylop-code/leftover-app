import { StyleSheet } from 'react-native';
import { color, space, typography } from '../../../../shared/theme';

const PIN = 40;

export const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  pin: {
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  text: { flex: 1, minWidth: 0 },
  // `.t-heading` at 16/22 in the artboard.
  label: { ...typography.heading, fontSize: 16, lineHeight: 22, color: color.textPrimary },
  hint: { ...typography.body, color: color.textSecondary },
  secondary: { ...typography.caption, color: color.textSecondary },
  change: { marginRight: -space[2] },
});

export const pinColor = color.primary;
