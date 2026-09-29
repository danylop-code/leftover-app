/** Mean Earth radius (IUGG), km. */
const EARTH_RADIUS_KM = 6371.0088;

export type LatLng = { lat: number; lng: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in km. Always compute from the currently selected location (gotchas.md). */
export const haversineKm = (a: LatLng, b: LatLng): number => {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
};
