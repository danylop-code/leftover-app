import { useEffect, useState } from 'react';
import { COUNTDOWN_TICK_MS } from '../../../shared/constants/orders';

/** The current time, re-read every `tickMs` so countdowns move on their own. */
export const useNow = (tickMs = COUNTDOWN_TICK_MS) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(timer);
  }, [tickMs]);
  return now;
};
