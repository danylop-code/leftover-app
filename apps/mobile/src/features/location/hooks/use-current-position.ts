import type { Place } from '@leftover/shared';
import { useCallback, useState } from 'react';
import { locateDevice } from '../../../shared/lib/device-geo';

export type PositionStatus = 'idle' | 'locating' | 'denied' | 'failed';

/**
 * "Use my current location": asks for permission, finds and labels the device position.
 * `locate` resolves to the place, or null with `status` saying why (denied → show the banner).
 */
export const useCurrentPosition = () => {
  const [status, setStatus] = useState<PositionStatus>('idle');
  const locate = useCallback(async (): Promise<Place | null> => {
    setStatus('locating');
    const result = await locateDevice();
    if (result.status === 'found') {
      setStatus('idle');
      return result.place;
    }
    setStatus(result.status);
    return null;
  }, []);
  return { status, locate };
};
