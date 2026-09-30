import { StyleSheet } from 'react-native';
import { color, fontFamily, space, tapMin, typography } from '../../../../shared/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[1],
    minHeight: tapMin,
  },
  text: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  link: {
    ...typography.label,
    fontFamily: fontFamily.body['700'],
    color: color.primary,
    textDecorationLine: 'underline',
  },
});

export const linkHitSlop = { top: 12, bottom: 12, left: 8, right: 8 };
