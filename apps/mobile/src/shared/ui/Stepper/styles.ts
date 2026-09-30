import { StyleSheet } from 'react-native';
import { color, hitSlopFor, radius, space, typography } from '../../theme';

const button = 44;
export const buttonHitSlop = hitSlopFor(button);

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    padding: space[1],
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    alignSelf: 'flex-start',
  },
  button: {
    width: button,
    height: button,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  buttonDisabled: { backgroundColor: color.surfaceSunken },
  value: { ...typography.heading, minWidth: 36, textAlign: 'center', color: color.textPrimary },
});

export const iconColor = { enabled: color.primary, disabled: color.textDisabled } as const;
