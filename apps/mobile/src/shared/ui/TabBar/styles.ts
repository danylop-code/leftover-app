import { StyleSheet } from 'react-native';
import { color, fontFamily, radius, space, tapMin } from '../../theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingHorizontal: space[3],
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  tab: { flex: 1, minHeight: tapMin, alignItems: 'center', justifyContent: 'center', gap: 2 },
  pill: {
    width: 56,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: color.primarySoft },
  label: {
    fontFamily: fontFamily.body['700'],
    fontSize: 12,
    lineHeight: 16,
    color: color.textSecondary,
  },
  labelActive: { color: color.primary },
});

// The design's 84px bar = 50 of tabs + 34 home indicator; the real inset comes from the device.
export const MIN_BOTTOM_PADDING = space[2];
export const tint = { active: color.primary, inactive: color.textSecondary } as const;
