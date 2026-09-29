import { useCallback, useEffect, useState } from 'react';
import { TOAST_DURATION_MS } from '../constants/ui';

export type ToastMessage = {
  message: string;
  tone: 'success' | 'error';
  action?: { label: string; onPress: () => void };
};

/** One toast at a time that hides itself after `durationMs`; `show(null)` hides it now. */
export const useToast = (durationMs = TOAST_DURATION_MS) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), durationMs);
    return () => clearTimeout(timer);
  }, [toast, durationMs]);
  const show = useCallback((next: ToastMessage | null) => setToast(next), []);
  return [toast, show] as const;
};
