import { makeStyles, radius, space } from '../../../../shared/theme';

export const useStyles = makeStyles(({ color, fontFamily, sheet }) => {
  // `.code-row` / `.code-box`
  const styles = sheet({
    // Codes are digits, read left to right in Arabic too: typing 1-2-3-4 must show 1234.
    row: { flexDirection: 'row', direction: 'ltr', gap: space[3], justifyContent: 'center' },
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
  return { styles };
});
