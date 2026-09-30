import { StyleSheet } from 'react-native';
import { color, typography } from '../../theme';

export const styles = StyleSheet.create({
  value: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: color.textPrimary,
  },
  placeholder: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: color.textSecondary,
  },
});

// Web: the DOM <input type="time"> blends into the kit field around it.
export const webInput = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: color.transparent,
  fontFamily: typography.body.fontFamily,
  fontSize: typography.body.fontSize,
  color: color.textPrimary,
} as const;
