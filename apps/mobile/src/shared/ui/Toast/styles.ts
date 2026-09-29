import { makeStyles, radius, space } from '../../theme';

export const actionHitSlop = { top: 4, bottom: 4, left: 0, right: 0 };

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  const styles = sheet({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: 56,
      paddingVertical: 10,
      paddingStart: space[4],
      paddingEnd: space[2],
      borderRadius: radius.lg,
      backgroundColor: color.inverse,
      ...elevation[3],
    },
    text: { ...typography.label, color: color.onInverse, flex: 1 },
    action: {
      height: 40,
      paddingHorizontal: space[3],
      justifyContent: 'center',
      borderRadius: radius.pill,
    },
    actionLabel: {
      fontFamily: fontFamily.body['700'],
      fontSize: 14,
      lineHeight: 20,
      color: color.toastAction,
    },
  });

  const iconColor = { success: color.toastSuccessIcon, error: color.toastErrorIcon } as const;
  return { styles, iconColor };
});
