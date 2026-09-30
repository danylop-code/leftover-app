import type { LatLng } from '@leftover/shared';
import { activeMarket } from './market';

// Where the map starts before a location is known: the market's seed city (Muscat or Lviv).
export const DEFAULT_MAP_CENTER: LatLng = activeMarket().center;
// Latitude span shown around a pin with no radius (~1.3 km).
export const DEFAULT_MAP_DELTA = 0.012;
export const KM_PER_DEGREE_LAT = 111;
// A radius circle fills this share of the visible span.
export const RADIUS_FRAME_FACTOR = 2.4;
export const METERS_PER_KM = 1000;
