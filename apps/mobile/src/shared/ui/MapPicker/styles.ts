import { makeStyles, radius } from '../../theme';

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

export const useStyles = makeStyles(({ color, map, sheet }) => {
  const styles = sheet({
    root: { height: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: map.land },
    map: { flex: 1 },
  });

  const pinColor = color.primary;
  // Web's CSS-drawn pin (MapPicker.web).
  const pin = { fill: color.primary, border: color.surface, shadow: color.mapPinShadow } as const;
  const circle = { fill: map.radiusFill, stroke: map.radiusStroke, strokeWidth: 2 } as const;

  return { styles, pinColor, pin, circle };
});
