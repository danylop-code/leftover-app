import { StyleSheet } from 'react-native';
import { color, elevation, hitSlopFor, radius } from '../../theme';

const SIZE = 40;

export const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    ...elevation[2],
  },
  pressed: { opacity: 0.8 },
});

export const heart = {
  saved: color.accent,
  idle: color.textPrimary,
  hitSlop: hitSlopFor(SIZE),
} as const;
