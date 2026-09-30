import { makeStyles, radius, space } from '../../theme';

const notch = 24;
const codeSpacing = 11.5;

export const useStyles = makeStyles(({ color, elevation, scriptFonts, typography, sheet }) => {
  const styles = sheet({
    ticket: { backgroundColor: color.surface, borderRadius: radius.xl, ...elevation[2] },
    band: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
      height: 48,
      borderTopStartRadius: radius.xl,
      borderTopEndRadius: radius.xl,
      backgroundColor: color.primary,
    },
    bandText: { ...typography.label, color: color.onPrimary },
    main: {
      alignItems: 'center',
      gap: 6,
      paddingTop: 22,
      paddingHorizontal: space[5],
      paddingBottom: space[4],
    },
    // Western digits in every language, so always the Latin display face: at 64/68 the Arabic
    // face's tall metrics cut the tops off.
    code: {
      fontFamily: scriptFonts.latin.display['600'],
      fontSize: 64,
      lineHeight: 68,
      paddingStart: codeSpacing,
      color: color.primary,
      textAlign: 'center',
    },
    cut: { height: notch, justifyContent: 'center' },
    dash: {
      marginHorizontal: space[6],
      borderTopWidth: 2,
      borderStyle: 'dashed',
      borderColor: color.border,
    },
    notch: {
      position: 'absolute',
      top: 0,
      width: notch,
      height: notch,
      borderRadius: notch / 2,
      backgroundColor: color.background,
    },
    notchLeft: { start: -notch / 2 },
    notchRight: { end: -notch / 2 },
    bottom: { paddingTop: space[3], paddingHorizontal: space[4], paddingBottom: 18 },
  });

  const bandIconColor = color.onPrimary;
  // Outside `sheet()`, which drops letter spacing in Arabic: the code is digits, not joined letters.
  const codeLetters = { letterSpacing: codeSpacing };
  return { styles, bandIconColor, codeLetters };
});
