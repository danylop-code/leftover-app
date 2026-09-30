import { StyleSheet } from 'react-native';
import { color, elevation, hitSlopFor, radius, tapMin } from '../../theme';

export const size = { md: tapMin, sm: 40 } as const;
export const smHitSlop = hitSlopFor(size.sm);

export const styles = StyleSheet.create({
  base: {
    width: size.md,
    height: size.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { width: size.sm, height: size.sm },
  plain: { backgroundColor: color.transparent },
  filled: { backgroundColor: color.surface, ...elevation[2] },
  tonal: { backgroundColor: color.primarySoft },
  pressed: { opacity: 0.7 },
});

export const iconColor = {
  plain: color.textPrimary,
  filled: color.textPrimary,
  tonal: color.primary,
} as const;
