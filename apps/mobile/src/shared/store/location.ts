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

// Client state only: where the customer looks for food. Remembered per account on this device
// (AsyncStorage, not secret), so the same person is never asked again, while another account
// on the same phone starts fresh. Rehydrated during bootstrap so routing knows what's set.
type Saved = { selected: Place | null; radiusKm: number; recent: Place[] };

type LocationState = Saved & {
  /** Whose area the fields above are (the signed-in user), or null when signed out. */
  userId: string | null;
  /** Every account's saved area on this device. */
  byUser: Record<string, Saved>;
  /** Being edited on the Location/LocationSearch screens; only `commitDraft` applies it. */
  draft: { place: Place | null; radiusKm: number };
  /** Shows `userId`'s saved area (sign-in, cold start) or nothing (sign-out). */
  switchUser: (userId: string | null) => void;
  startDraft: () => void;
  setDraftPlace: (place: Place) => void;
  setDraftRadius: (km: number) => void;
  commitDraft: () => void;
  addRecent: (place: Place) => void;
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

const SavedSchema = z.object({
  selected: Place.nullable(),
  radiusKm: z.number().int().min(RADIUS_MIN_KM).max(RADIUS_MAX_KM),
  recent: z.array(Place).max(RECENT_LIMIT),
});
const Persisted = z.object({ byUser: z.record(z.string(), SavedSchema) });

const nothing: Saved = { selected: null, radiusKm: RADIUS_DEFAULT_KM, recent: [] };

/** Set once the saved areas have loaded; nothing is written before that. */
let loaded = false;

const savedFor = (byUser: Record<string, Saved>, userId: string | null): Saved =>
  (userId && byUser[userId]) || nothing;

export const useLocation = create<LocationState>()(
  persist(
    (set, get) => {
      /** Applies a change to the live fields and to the signed-in account's saved copy. */
      const save = (change: Partial<Saved>) => {
        const { userId, byUser, selected, radiusKm, recent } = get();
        const next = { selected, radiusKm, recent, ...change };
        set({ ...change, byUser: userId ? { ...byUser, [userId]: next } : byUser });
      };
      return {
        ...nothing,
        userId: null,
        byUser: {},
        draft: { place: null, radiusKm: RADIUS_DEFAULT_KM },
        switchUser: (userId) => {
          const { byUser } = get();
          const saved = savedFor(byUser, userId);
          set({ userId, ...saved, draft: { place: saved.selected, radiusKm: saved.radiusKm } });
        },
        startDraft: () => {
          const { selected, radiusKm } = get();
          set({ draft: { place: selected, radiusKm } });
        },
        setDraftPlace: (place) => set((s) => ({ draft: { ...s.draft, place } })),
        setDraftRadius: (km) => set((s) => ({ draft: { ...s.draft, radiusKm: clampRadius(km) } })),
        commitDraft: () => {
          const { draft } = get();
          if (!draft.place) return;
          save({ selected: draft.place, radiusKm: draft.radiusKm });
        },
        addRecent: (place) => save({ recent: withRecent(get().recent, place) }),
      };
    },
    {
      name: LOCATION_STORAGE_KEY,
      // v1 kept one device-wide area; it can't be given to an account, so it's dropped.
      version: 2,
      migrate: () => ({ byUser: {} }),
      // No writes until the saved areas have loaded: an early `switchUser` (the session can load
      // first) would otherwise overwrite them with an empty map.
      storage: createJSONStorage(() => ({
        getItem: (key) => AsyncStorage.getItem(key),
        setItem: (key, value) => (loaded ? AsyncStorage.setItem(key, value) : undefined),
        removeItem: (key) => AsyncStorage.removeItem(key),
      })),
      // Rehydrated by the app bootstrap, which holds the splash until it's done.
      skipHydration: true,
      partialize: ({ byUser }) => ({ byUser }),
      onRehydrateStorage: () => () => {
        loaded = true;
      },
      // A corrupt entry is ignored rather than trusted. The live fields follow whichever
      // account is already signed in, whether the session or this store loaded first.
      merge: (stored, current) => {
        const parsed = Persisted.safeParse(stored);
        if (!parsed.success) return current;
        const { byUser } = parsed.data;
        return { ...current, byUser, ...savedFor(byUser, current.userId) };
      },
    },
  ),
);

export const searchAreaOf = (s: Pick<LocationState, 'selected' | 'radiusKm'>): SearchArea | null =>
  s.selected ? { lat: s.selected.lat, lng: s.selected.lng, radiusKm: s.radiusKm } : null;
