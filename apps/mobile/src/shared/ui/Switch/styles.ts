import { StyleSheet } from 'react-native';
import { color, elevation, hitSlopFor, radius } from '../../theme';

const width = 52;
const height = 32;
const knob = 26;
const inset = 3;
export const switchHitSlop = hitSlopFor(height);

export const styles = StyleSheet.create({
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
    left: inset,
    width: knob,
    height: knob,
    borderRadius: knob / 2,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  knobOn: { left: width - knob - inset },
  disabled: { opacity: 0.5 },
});
