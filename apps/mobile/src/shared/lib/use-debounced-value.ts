import { useEffect, useState } from 'react';

/**
 * `value`, once it has stopped changing for `delayMs`. Values for which `immediate` returns
 * true (e.g. a cleared search) apply at once.
 */
export const useDebouncedValue = <T>(
  value: T,
  delayMs: number,
  immediate?: (value: T) => boolean,
): T => {
  const [debounced, setDebounced] = useState(value);
  const now = immediate?.(value) ?? false;
  useEffect(() => {
    if (now) {
      setDebounced(value);
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs, now]);
  return debounced;
};
