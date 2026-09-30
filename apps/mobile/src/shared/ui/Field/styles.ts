import { makeStyles, radius, space } from '../../theme';

export const INPUT_HEIGHT = 52;
export const TEXTAREA_MIN_HEIGHT = 112;

export const useStyles = makeStyles(({ color, fontFamily, typography, sheet }) => {
  const styles = sheet({
    root: { gap: 6 },
    labelRow: { flexDirection: 'row', gap: space[1], alignItems: 'baseline' },
    label: { ...typography.label, color: color.textPrimary },
    optional: {
      ...typography.label,
      fontFamily: fontFamily.body['500'],
      color: color.textSecondary,
    },
    foot: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
    help: { ...typography.caption, color: color.textSecondary, flexShrink: 1 },
    errorRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexShrink: 1 },
    error: { ...typography.caption, fontFamily: fontFamily.body['600'], color: color.danger },
    counter: { ...typography.caption, color: color.textSecondary, marginStart: 'auto' },
    counterOver: { color: color.danger },
  });

  const inputStyles = sheet({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: INPUT_HEIGHT,
      paddingHorizontal: space[4],
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: color.borderStrong,
      backgroundColor: color.surface,
    },
    pill: { borderRadius: radius.pill },
    focus: { borderColor: color.primary },
    error: { borderColor: color.danger },
    // No lineHeight: on iOS it pushes single-line TextInput text below centre (misaligned with
    // the icon). Font and size still match `typography.body`.
    input: {
      fontFamily: typography.body.fontFamily,
      fontSize: typography.body.fontSize,
      flex: 1,
      minWidth: 0,
      height: '100%',
      padding: 0,
      color: color.textPrimary,
    },
    prefix: {
      fontFamily: fontFamily.body['600'],
      fontSize: 16,
      lineHeight: 24,
      color: color.textSecondary,
    },
    textarea: {
      ...typography.body,
      minHeight: TEXTAREA_MIN_HEIGHT,
      paddingVertical: 14,
      paddingHorizontal: space[4],
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: color.borderStrong,
      backgroundColor: color.surface,
      color: color.textPrimary,
      textAlignVertical: 'top',
    },
  });

  const placeholderColor = color.textSecondary;
  const iconColor = color.textSecondary;
  return { styles, inputStyles, placeholderColor, iconColor };
});
