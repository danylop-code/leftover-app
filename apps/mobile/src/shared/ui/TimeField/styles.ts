import { makeStyles } from '../../theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
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
    // The iOS spinner has its own width; centre it in the sheet instead of leaving it at the start.
    picker: { alignSelf: 'center' },
  });

  // The spinner draws its digits natively: give it the scheme and the text color explicitly,
  // or it stays black on the dark sheet.
  const pickerTextColor = color.textPrimary;

  // Web: the DOM <input type="time"> blends into the kit field around it.
  const webInput = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: color.transparent,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: color.textPrimary,
  } as const;
  return { styles, webInput, pickerTextColor };
});
