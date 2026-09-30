import type { LatLng } from '@leftover/shared';
import { DEFAULT_MAP_DELTA, KM_PER_DEGREE_LAT, RADIUS_FRAME_FACTOR } from '../../constants/map';

/** Region centred on `point`, zoomed to frame the radius circle when there is one. */
export const regionFor = (point: LatLng, radiusKm?: number) => {
  const latitudeDelta = radiusKm
    ? (radiusKm * RADIUS_FRAME_FACTOR) / KM_PER_DEGREE_LAT
    : DEFAULT_MAP_DELTA;
  return {
    latitude: point.lat,
    longitude: point.lng,
    latitudeDelta,
    longitudeDelta: latitudeDelta,
  };
};
