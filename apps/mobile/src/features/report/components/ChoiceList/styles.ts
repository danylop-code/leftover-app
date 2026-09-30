import { StyleSheet } from 'react-native';
import { color, radius, space, tapMin, typography } from '../../../../shared/theme';

const DOT = 22;

export const styles = StyleSheet.create({
  list: { backgroundColor: color.surface, borderRadius: radius.xl, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: tapMin,
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  last: { borderBottomWidth: 0 },
  pressed: { backgroundColor: color.surfaceSunken },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
    borderColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: color.primary, borderColor: color.primary },
  label: { ...typography.body, flex: 1, color: color.textPrimary },
});

export const checkColor = color.onPrimary;
