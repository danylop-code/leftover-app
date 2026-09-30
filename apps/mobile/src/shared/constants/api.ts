// Used when EXPO_PUBLIC_API_URL is unset: the local `wrangler dev` Worker.
export const DEFAULT_API_URL = 'http://localhost:8787';
// Retries for network and 5xx failures; 4xx and parse failures never retry.
export const MAX_QUERY_RETRIES = 2;
