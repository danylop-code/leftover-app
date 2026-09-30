import type { LatLng } from '@leftover/shared';
import { Platform, type PlatformOSType } from 'react-native';

/** A link that opens the platform's maps app with directions to `to`. */
export const directionsUrl = (
  to: LatLng,
  label: string,
  os: PlatformOSType = Platform.OS,
): string => {
  const point = `${to.lat},${to.lng}`;
  const name = encodeURIComponent(label);
  if (os === 'ios') return `https://maps.apple.com/?daddr=${point}&q=${name}`;
  if (os === 'android') return `geo:${point}?q=${point}(${name})`;
  return `https://www.google.com/maps/dir/?api=1&destination=${point}`;
};
