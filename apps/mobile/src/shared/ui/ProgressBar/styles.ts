import { makeStyles, radius } from '../../theme';

const HEIGHT = 6;

export const useStyles = makeStyles(({ color, sheet }) => {
  const styles = sheet({
    track: {
      height: HEIGHT,
      borderRadius: radius.pill,
      backgroundColor: color.surfaceSunken,
      overflow: 'hidden',
    },
    fill: { height: HEIGHT, borderRadius: radius.pill, backgroundColor: color.accent },
  });
  return { styles };
});
