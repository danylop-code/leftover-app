import type { LatLng } from '@leftover/shared';

// Where the map starts before a location is known: central Lviv (the seed city).
export const DEFAULT_MAP_CENTER: LatLng = { lat: 49.8397, lng: 24.0297 };
// Latitude span shown around a pin with no radius (~1.3 km).
export const DEFAULT_MAP_DELTA = 0.012;
export const KM_PER_DEGREE_LAT = 111;
// A radius circle fills this share of the visible span.
export const RADIUS_FRAME_FACTOR = 2.4;
export const METERS_PER_KM = 1000;
