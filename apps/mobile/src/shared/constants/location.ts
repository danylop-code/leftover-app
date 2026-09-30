// Search radius around the selected location (Location screen slider).
export const RADIUS_MIN_KM = 1;
export const RADIUS_MAX_KM = 30;
export const RADIUS_DEFAULT_KM = 5;
export const RADIUS_STEP_KM = 1;
// Recent places kept on the device.
export const RECENT_LIMIT = 5;
// Two places this close (degrees, ~10 m) count as the same spot in recents.
export const SAME_SPOT_DEGREES = 0.0001;

// Address autocomplete: wait for typing to pause, and give the API this long before falling
// back to on-device geocoding.
export const SUGGEST_DEBOUNCE_MS = 300;
export const SUGGEST_TIMEOUT_MS = 5000;
// On-device fallback results shown (each needs a reverse-geocode for its label).
export const DEVICE_SUGGESTION_LIMIT = 3;
