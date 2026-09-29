import { StyleSheet } from 'react-native';
import { color, map, radius } from '../../theme';

export const styles = StyleSheet.create({
  root: { height: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: map.land },
  map: { flex: 1 },
});

export const pinColor = color.primary;
export const circle = { fill: map.radiusFill, stroke: map.radiusStroke, strokeWidth: 2 } as const;

// Web map (MapPicker.web.tsx): OpenStreetMap tiles; zoom that frames a radius circle.
const ZOOM_NO_RADIUS = 16;
const ZOOM_AT_1_KM = 14;
export const zoomFor = (radiusKm?: number) =>
  radiusKm ? Math.max(8, Math.round(ZOOM_AT_1_KM - Math.log2(radiusKm))) : ZOOM_NO_RADIUS;
export const tiles = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
  container: { width: '100%', height: '100%' },
} as const;
