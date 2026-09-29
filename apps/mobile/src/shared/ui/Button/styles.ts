import { StyleSheet } from 'react-native';
import { color, fontFamily, hitSlopFor, radius, space } from '../../theme';

export const size = { md: 52, sm: 40 } as const;
export const smHitSlop = hitSlopFor(size.sm);

export const styles = StyleSheet.create({
  base: {
    height: size.md,
    paddingHorizontal: space[6],
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    // Standalone buttons centre (design language); `block` stretches, rows align them anyway.
    alignSelf: 'center',
  },
  sm: { height: size.sm, paddingHorizontal: space[4] },
  block: { alignSelf: 'stretch' },
  primary: { backgroundColor: color.accent },
  primaryPressed: { backgroundColor: color.accentPressed },
  secondary: { backgroundColor: color.surface, borderWidth: 1.5, borderColor: color.primary },
  secondaryPressed: { backgroundColor: color.primarySoft },
  ghost: { backgroundColor: color.transparent },
  ghostPressed: { backgroundColor: color.primarySoft },
  disabled: { backgroundColor: color.surfaceSunken, borderWidth: 0 },
  label: { fontFamily: fontFamily.body['700'], fontSize: 16, lineHeight: 20 },
  labelSm: { fontSize: 14 },
});

export const labelColor = {
  primary: color.onAccent,
  secondary: color.primary,
  ghost: color.primary,
  danger: color.danger,
  disabled: color.textDisabled,
} as const;
