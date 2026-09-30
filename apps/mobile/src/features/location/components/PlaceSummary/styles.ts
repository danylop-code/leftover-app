import { makeStyles, space } from '../../../../shared/theme';

const PIN = 40;

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    root: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    pin: {
      width: PIN,
      height: PIN,
      borderRadius: PIN / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color.primarySoft,
    },
    text: { flex: 1, minWidth: 0 },
    // `.t-heading` at 16/22 in the artboard.
    label: { ...typography.heading, fontSize: 16, lineHeight: 22, color: color.textPrimary },
    hint: { ...typography.body, color: color.textSecondary },
    secondary: { ...typography.caption, color: color.textSecondary },
    change: { marginEnd: -space[2] },
  });

  const pinColor = color.primary;
  return { styles, pinColor };
});
