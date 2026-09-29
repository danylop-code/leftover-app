import { StyleSheet } from 'react-native';
import { hitSlopFor } from '../../theme';

// `.star` 16 (display) · 26 in a 40 button (sub-rating) · 44 in a 56 button (overall).
export const starSize = { sm: 16, md: 26, lg: 44 } as const;
export const buttonSize = { sm: 40, md: 40, lg: 56 } as const;
export const buttonHitSlop = {
  sm: hitSlopFor(40),
  md: hitSlopFor(40),
  lg: hitSlopFor(56),
} as const;

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  button: { alignItems: 'center', justifyContent: 'center' },
  sm: { width: buttonSize.sm, height: buttonSize.sm },
  md: { width: buttonSize.md, height: buttonSize.md },
  lg: { width: buttonSize.lg, height: buttonSize.lg },
});
