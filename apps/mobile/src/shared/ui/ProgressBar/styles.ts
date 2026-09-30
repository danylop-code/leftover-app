import { StyleSheet } from 'react-native';
import { color, radius } from '../../theme';

const HEIGHT = 6;

export const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceSunken,
    overflow: 'hidden',
  },
  fill: { height: HEIGHT, borderRadius: radius.pill, backgroundColor: color.accent },
});
