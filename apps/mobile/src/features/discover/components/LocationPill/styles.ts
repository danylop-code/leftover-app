import { makeStyles, radius, space } from '../../../../shared/theme';

const PIN = 40;
export const PILL_HEIGHT = 56;

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  // `.loc-pill`, `.loc-pin`, `.loc-label`, `.loc-addr`, `.loc-radius`
  const styles = sheet({
    root: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: PILL_HEIGHT,
      paddingStart: space[2],
      paddingEnd: 14,
      borderRadius: radius.pill,
      backgroundColor: color.surface,
      ...elevation[1],
    },
    pressed: { opacity: 0.85 },
    pin: {
      width: PIN,
      height: PIN,
      borderRadius: PIN / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color.primarySoft,
    },
    text: { flex: 1, minWidth: 0 },
    caption: { ...typography.caption, color: color.textSecondary },
    address: {
      fontFamily: fontFamily.body['700'],
      fontSize: 15,
      lineHeight: 20,
      color: color.textPrimary,
    },
    radius: {
      fontFamily: fontFamily.body['700'],
      fontSize: 12,
      lineHeight: 16,
      paddingVertical: space[1],
      paddingHorizontal: space[2],
      borderRadius: radius.pill,
      overflow: 'hidden',
      backgroundColor: color.primarySoft,
      color: color.primary,
    },
  });

  const pinColor = color.primary;
  const chevronColor = color.textSecondary;
  return { styles, pinColor, chevronColor };
});
