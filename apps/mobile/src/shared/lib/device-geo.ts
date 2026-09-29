import { haversineKm, type LatLng, type Place, type PlaceSuggestion } from '@leftover/shared';
import * as Location from 'expo-location';
import { DEVICE_SUGGESTION_LIMIT } from '../constants/location';
import i18n from '../i18n';

// On-device geocoding (expo-location): labels for pins and the device position, and the
// fallback when the API's address search is unavailable. iOS/Android only; 17 adds web.

type Address = Location.LocationGeocodedAddress;

const describe = (a: Address): Pick<Place, 'label' | 'secondary'> | null => {
  const streetLine = a.street ? [a.street, a.streetNumber].filter(Boolean).join(' ') : null;
  const label = streetLine ?? a.name;
  if (!label) return null;
  const secondary = [a.city ?? a.subregion ?? a.region, a.country].filter(Boolean).join(', ');
  return secondary ? { label, secondary } : { label };
};

/** The place at `point`, labelled by reverse geocoding (or "Dropped pin" when that fails). */
export const placeAt = async (point: LatLng): Promise<Place> => {
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude: point.lat,
      longitude: point.lng,
    });
    const text = address ? describe(address) : null;
    if (text) return { ...text, lat: point.lat, lng: point.lng };
  } catch {
    // fall through
  }
  return { label: i18n.t('location.droppedPin'), lat: point.lat, lng: point.lng };
};

export type LocateResult =
  | { status: 'found'; place: Place }
  | { status: 'denied' }
  | { status: 'failed' };

/** Asks for foreground permission, then finds and labels the device position. */
export const locateDevice = async (): Promise<LocateResult> => {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const place = await placeAt({ lat: coords.latitude, lng: coords.longitude });
    return { status: 'found', place };
  } catch {
    return { status: 'failed' };
  }
};

/** Address search on the device, labelled and sorted nearest to `near` first. */
export const searchOnDevice = async (
  query: string,
  near: LatLng | null,
): Promise<PlaceSuggestion[]> => {
  let points: LatLng[];
  try {
    const found = await Location.geocodeAsync(query);
    points = found.map((p) => ({ lat: p.latitude, lng: p.longitude }));
  } catch {
    return [];
  }
  if (near) points.sort((a, b) => haversineKm(near, a) - haversineKm(near, b));
  const places = await Promise.all(points.slice(0, DEVICE_SUGGESTION_LIMIT).map(placeAt));
  return places.map((place) => ({ id: `device:${place.lat},${place.lng}`, ...place }));
};
