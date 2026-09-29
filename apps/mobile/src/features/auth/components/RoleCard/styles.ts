import { makeStyles, radius, space } from '../../../../shared/theme';

const check = 24;
const tile = 44;

export const useStyles = makeStyles(({ color, fontFamily, typography, sheet }) => {
  const styles = sheet({
    card: {
      flex: 1,
      gap: space[2],
      padding: space[4],
      minHeight: 136,
      borderRadius: radius.xl,
      backgroundColor: color.surface,
      borderWidth: 1.5,
      borderColor: color.border,
    },
    selected: { backgroundColor: color.primaryTint, borderWidth: 2, borderColor: color.primary },
    check: {
      position: 'absolute',
      end: space[3],
      top: space[3],
      width: check,
      height: check,
      borderRadius: check / 2,
      borderWidth: 1.5,
      borderColor: color.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: color.primary, borderWidth: 0 },
    tile: {
      width: tile,
      height: tile,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileCustomer: { backgroundColor: color.primary },
    tileStore: { backgroundColor: color.accentSoft },
    title: { ...typography.heading, fontSize: 16, lineHeight: 20, color: color.textPrimary },
    hint: {
      ...typography.caption,
      fontFamily: fontFamily.body['500'],
      fontSize: 13,
      color: color.textSecondary,
    },
  });

  const tint = {
    checkMark: color.onPrimary,
    customer: color.onPrimary,
    store: color.accentPressed,
  } as const;
  return { styles, tint };
});
