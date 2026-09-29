import { type LatLng, type Place, type PlaceSuggestion, ReverseResponse } from '@leftover/shared';
import * as Location from 'expo-location';
import { apiRequest } from '../api/client';
import i18n from '../i18n';

// Web (brief 17): browsers have no geocoder, so labels come from the API (the same Photon
// provider as address search) and there is no on-device search fallback.

/** The place at `point`, labelled by the API (or "Dropped pin" when that fails). */
export const placeAt = async (point: LatLng): Promise<Place> => {
  try {
    const { place } = await apiRequest('/geo/reverse', {
      schema: ReverseResponse,
      query: { lat: point.lat, lng: point.lng },
    });
    if (place) return place;
  } catch {
    // fall through
  }
  return { label: i18n.t('location.droppedPin'), lat: point.lat, lng: point.lng };
};

export type LocateResult =
  | { status: 'found'; place: Place }
  | { status: 'denied' }
  | { status: 'failed' };

/** Asks the browser for the position (expo-location wraps navigator.geolocation) and labels it. */
export const locateDevice = async (): Promise<LocateResult> => {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      status: 'found',
      place: await placeAt({ lat: coords.latitude, lng: coords.longitude }),
    };
  } catch {
    return { status: 'failed' };
  }
};

/** No on-device search on web; the API's provider is the only source. */
export const searchOnDevice = async (
  _query: string,
  _near: LatLng | null,
): Promise<PlaceSuggestion[]> => [];
