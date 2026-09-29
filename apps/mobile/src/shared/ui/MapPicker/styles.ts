import { StyleSheet } from 'react-native';
import { color, map, radius } from '../../theme';

export const styles = StyleSheet.create({
  root: { height: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: map.land },
  map: { flex: 1 },
});

export const pinColor = color.primary;
export const circle = { fill: map.radiusFill, stroke: map.radiusStroke, strokeWidth: 2 } as const;
