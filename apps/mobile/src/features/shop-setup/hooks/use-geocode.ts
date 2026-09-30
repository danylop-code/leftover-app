import type { LatLng } from '@leftover/shared';
import * as Location from 'expo-location';
import { useCallback } from 'react';

/**
 * On-device address lookup (expo-location). Resolves to the best match, or null when nothing
 * is found or the lookup fails. iOS/Android only; brief 17 adds a web fallback.
 */
export const useGeocode = () =>
  useCallback(async (address: string): Promise<LatLng | null> => {
    try {
      const [best] = await Location.geocodeAsync(address);
      return best ? { lat: best.latitude, lng: best.longitude } : null;
    } catch {
      return null;
    }
  }, []);
