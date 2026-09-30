import { hitSlopFor, makeStyles, radius } from '../../theme';

const width = 52;
const height = 32;
const knob = 26;
const inset = 3;
export const switchHitSlop = hitSlopFor(height);

export const useStyles = makeStyles(({ color, elevation, sheet }) => {
  const styles = sheet({
    track: {
      width,
      height,
      borderRadius: radius.pill,
      backgroundColor: color.switchTrackOff,
      justifyContent: 'center',
    },
    on: { backgroundColor: color.primary },
    knob: {
      position: 'absolute',
      start: inset,
      width: knob,
      height: knob,
      borderRadius: knob / 2,
      backgroundColor: color.surface,
      ...elevation[1],
    },
    knobOn: { start: width - knob - inset },
    disabled: { opacity: 0.5 },
  });
  return { styles };
});
