import { StyleSheet } from 'react-native';
import { color, fontFamily, radius, space } from '../../../../shared/theme';

// `.code-row` / `.code-box`
export const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[3], justifyContent: 'center' },
  box: {
    flex: 1,
    maxWidth: 64,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.borderStrong,
    backgroundColor: color.surface,
    textAlign: 'center',
    fontFamily: fontFamily.display['600'],
    fontSize: 28,
    color: color.textPrimary,
  },
  filled: { borderColor: color.primary, backgroundColor: color.primaryTint },
  invalid: { borderColor: color.danger, backgroundColor: color.dangerSoft },
});
