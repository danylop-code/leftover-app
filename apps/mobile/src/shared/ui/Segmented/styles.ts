import { makeStyles, radius, space, tapMin } from '../../theme';

const pad = space[1];

export const segmentHitSlop = { top: pad, bottom: pad, left: 0, right: 0 };

export const useStyles = makeStyles(({ color, elevation, fontFamily, typography, sheet }) => {
  const styles = sheet({
    root: {
      flexDirection: 'row',
      height: tapMin,
      padding: pad,
      borderRadius: radius.pill,
      backgroundColor: color.surfaceSunken,
    },
    segment: {
      flex: 1,
      height: tapMin - pad * 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: radius.pill,
    },
    active: { backgroundColor: color.surface, ...elevation[1] },
    label: { ...typography.label, color: color.textSecondary },
    labelActive: { color: color.textPrimary },
    count: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: radius.pill,
      backgroundColor: color.primary,
      color: color.onPrimary,
      fontFamily: fontFamily.body['700'],
      fontSize: 11,
      lineHeight: 20,
      textAlign: 'center',
      overflow: 'hidden',
    },
  });

  return { styles };
});
