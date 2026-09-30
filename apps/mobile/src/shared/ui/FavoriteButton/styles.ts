import { hitSlopFor, makeStyles, radius } from '../../theme';

const SIZE = 40;

export const useStyles = makeStyles(({ color, elevation, sheet }) => {
  const styles = sheet({
    button: {
      width: SIZE,
      height: SIZE,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color.surface,
      ...elevation[2],
    },
    pressed: { opacity: 0.8 },
  });

  const heart = {
    saved: color.accent,
    idle: color.textPrimary,
    hitSlop: hitSlopFor(SIZE),
  } as const;
  return { styles, heart };
});
