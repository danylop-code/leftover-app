import { makeStyles, radius } from '../../theme';

export const useStyles = makeStyles(({ color, fontFamily, sheet }) => {
  const styles = sheet({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      height: 24,
      paddingHorizontal: 10,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    onSunken: { borderWidth: 1, borderColor: color.border },
    dot: { width: 6, height: 6, borderRadius: 3 },
    label: { fontFamily: fontFamily.body['700'], fontSize: 12, lineHeight: 16 },
  });

  // `.badge-*`: background, text and (stock only) dot color per tone.
  const tones = {
    stock: { bg: color.surface, fg: color.textPrimary, dot: color.accent },
    low: { bg: color.accentSoft, fg: color.accentPressed, dot: color.accentPressed },
    out: { bg: color.surfaceSunken, fg: color.textSecondary, dot: color.textDisabled },
    reserved: { bg: color.primarySoft, fg: color.primary, dot: null },
    ready: { bg: color.successSoft, fg: color.success, dot: null },
    collected: { bg: color.surfaceSunken, fg: color.textSecondary, dot: null },
    cancelled: { bg: color.dangerSoft, fg: color.danger, dot: null },
    missed: { bg: color.warningSoft, fg: color.warning, dot: null },
    discount: { bg: color.accentSoft, fg: color.accentPressed, dot: null },
  } as const;
  return { styles, tones };
});
