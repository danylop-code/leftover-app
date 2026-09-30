import { makeStyles, radius, tapMin } from '../../theme';

export const THUMB = 28;
const track = 6;

export const useStyles = makeStyles(({ color, elevation, sheet }) => {
  const styles = sheet({
    root: { height: tapMin, justifyContent: 'center' },
    track: { height: track, borderRadius: radius.pill, backgroundColor: color.surfaceSunken },
    fill: {
      position: 'absolute',
      start: 0,
      height: track,
      borderRadius: radius.pill,
      backgroundColor: color.primary,
    },
    thumb: {
      position: 'absolute',
      width: THUMB,
      height: THUMB,
      borderRadius: THUMB / 2,
      marginStart: -THUMB / 2,
      backgroundColor: color.surface,
      borderWidth: 2,
      borderColor: color.primary,
      ...elevation[2],
    },
  });
  return { styles };
});
