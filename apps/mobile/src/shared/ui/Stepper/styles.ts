import { hitSlopFor, makeStyles, radius, space } from '../../theme';

const button = 44;
export const buttonHitSlop = hitSlopFor(button);

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      padding: space[1],
      borderRadius: radius.pill,
      backgroundColor: color.surface,
      borderWidth: 1,
      borderColor: color.border,
      alignSelf: 'flex-start',
    },
    button: {
      width: button,
      height: button,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color.primarySoft,
    },
    buttonDisabled: { backgroundColor: color.surfaceSunken },
    value: { ...typography.heading, minWidth: 36, textAlign: 'center', color: color.textPrimary },
  });

  const iconColor = { enabled: color.primary, disabled: color.textDisabled } as const;
  return { styles, iconColor };
});
