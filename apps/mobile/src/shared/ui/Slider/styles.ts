import { StyleSheet } from 'react-native';
import { color, elevation, radius, tapMin } from '../../theme';

export const THUMB = 28;
const track = 6;

export const styles = StyleSheet.create({
  root: { height: tapMin, justifyContent: 'center' },
  track: { height: track, borderRadius: radius.pill, backgroundColor: color.surfaceSunken },
  fill: {
    position: 'absolute',
    left: 0,
    height: track,
    borderRadius: radius.pill,
    backgroundColor: color.primary,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    marginLeft: -THUMB / 2,
    backgroundColor: color.surface,
    borderWidth: 2,
    borderColor: color.primary,
    ...elevation[2],
  },
});
