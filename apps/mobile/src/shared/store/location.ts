import { Place } from '@leftover/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  RADIUS_DEFAULT_KM,
  RADIUS_MAX_KM,
  RADIUS_MIN_KM,
  RADIUS_STEP_KM,
  RECENT_LIMIT,
  SAME_SPOT_DEGREES,
} from '../constants/location';

export const LOCATION_STORAGE_KEY = 'leftover.location';

/** What every distance and nearby query is computed from (gotchas.md: never a cached copy). */
export type SearchArea = { lat: number; lng: number; radiusKm: number };

// Client state only: where the customer looks for food. Persisted in AsyncStorage (not
// secret), rehydrated during bootstrap so routing knows whether a location is set.
type LocationState = {
  selected: Place | null;
  radiusKm: number;
  /** Newest first, deduped, at most RECENT_LIMIT. */
  recent: Place[];
  /** Being edited on the Location/LocationSearch screens; only `commitDraft` applies it. */
  draft: { place: Place | null; radiusKm: number };
  startDraft: () => void;
  setDraftPlace: (place: Place) => void;
  setDraftRadius: (km: number) => void;
  commitDraft: () => void;
  addRecent: (place: Place) => void;
  /** Forgets everything (on logout). */
  clear: () => void;
};

export const clampRadius = (km: number) => {
  const stepped = Math.round(km / RADIUS_STEP_KM) * RADIUS_STEP_KM;
  return Math.min(RADIUS_MAX_KM, Math.max(RADIUS_MIN_KM, stepped));
};

const samePlace = (a: Place, b: Place) =>
  (a.label === b.label && a.secondary === b.secondary) ||
  (Math.abs(a.lat - b.lat) < SAME_SPOT_DEGREES && Math.abs(a.lng - b.lng) < SAME_SPOT_DEGREES);

export const withRecent = (recent: Place[], place: Place) =>
  [place, ...recent.filter((p) => !samePlace(p, place))].slice(0, RECENT_LIMIT);

const Persisted = z.object({
  selected: Place.nullable(),
  radiusKm: z.number().int().min(RADIUS_MIN_KM).max(RADIUS_MAX_KM),
  recent: z.array(Place).max(RECENT_LIMIT),
});

const empty = {
  selected: null,
  radiusKm: RADIUS_DEFAULT_KM,
  recent: [],
  draft: { place: null, radiusKm: RADIUS_DEFAULT_KM },
};

export const useLocation = create<LocationState>()(
  persist(
    (set, get) => ({
      ...empty,
      startDraft: () => {
        const { selected, radiusKm } = get();
        set({ draft: { place: selected, radiusKm } });
      },
      setDraftPlace: (place) => set((s) => ({ draft: { ...s.draft, place } })),
      setDraftRadius: (km) => set((s) => ({ draft: { ...s.draft, radiusKm: clampRadius(km) } })),
      commitDraft: () => {
        const { draft } = get();
        if (!draft.place) return;
        set({ selected: draft.place, radiusKm: draft.radiusKm });
      },
      addRecent: (place) => set((s) => ({ recent: withRecent(s.recent, place) })),
      clear: () => set(empty),
    }),
    {
      name: LOCATION_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Rehydrated by the app bootstrap, which holds the splash until it's done.
      skipHydration: true,
      partialize: ({ selected, radiusKm, recent }) => ({ selected, radiusKm, recent }),
      // A corrupt or outdated entry is ignored rather than trusted.
      merge: (stored, current) => {
        const parsed = Persisted.safeParse(stored);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);

export const searchAreaOf = (s: Pick<LocationState, 'selected' | 'radiusKm'>): SearchArea | null =>
  s.selected ? { lat: s.selected.lat, lng: s.selected.lng, radiusKm: s.radiusKm } : null;
