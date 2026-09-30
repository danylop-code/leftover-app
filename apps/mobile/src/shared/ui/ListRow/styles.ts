import { StyleSheet } from 'react-native';
import { color, fontFamily, radius, space, typography } from '../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
    paddingHorizontal: space[4],
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  last: { borderBottomWidth: 0 },
  pressed: { backgroundColor: color.surfaceSunken },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  iconDanger: { backgroundColor: color.dangerSoft },
  label: {
    flex: 1,
    fontFamily: fontFamily.body['500'],
    fontSize: 16,
    lineHeight: 22,
    color: color.textPrimary,
  },
  labelDanger: { color: color.danger },
  value: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  group: { gap: space[2] },
  list: { backgroundColor: color.surface, borderRadius: radius.xl, overflow: 'hidden' },
  groupLabel: {
    ...typography.caption,
    fontFamily: fontFamily.body['700'],
    letterSpacing: 0.72,
    textTransform: 'uppercase',
    color: color.textSecondary,
    paddingHorizontal: space[1],
  },
});

export const iconColor = {
  default: color.primary,
  danger: color.danger,
  chevron: color.textSecondary,
};
