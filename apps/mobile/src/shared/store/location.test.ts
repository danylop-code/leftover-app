import type { Place } from '@leftover/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { keys } from '../api/keys';
import { RADIUS_DEFAULT_KM, RECENT_LIMIT } from '../constants/location';
import { LOCATION_STORAGE_KEY, searchAreaOf, useLocation } from './location';

const rynok: Place = {
  label: 'Rynok Square 1',
  secondary: 'Lviv, Ukraine',
  lat: 49.8419,
  lng: 24.0315,
};
const dorosh: Place = {
  label: 'vul. Doroshenka 14',
  secondary: 'Lviv, Ukraine',
  lat: 49.8399,
  lng: 24.0299,
};

const state = () => useLocation.getState();
const nearbyKey = () => {
  const area = searchAreaOf(state());
  if (!area) throw new Error('no search area');
  return keys.nearby({ ...area, category: null });
};

describe('location store', () => {
  it('starts with no place and the default radius', () => {
    expect(state()).toMatchObject({ selected: null, radiusKm: RADIUS_DEFAULT_KM, recent: [] });
  });

  it.each([
    [5.4, 5],
    [5.6, 6],
    [0, 1],
    [-3, 1],
    [42, 30],
  ])('keeps the draft radius on whole km within 1–30 (%p → %p)', (input, expected) => {
    state().setDraftRadius(input);
    expect(state().draft.radiusKm).toBe(expected);
  });

  it('adds recents at the top, deduped by address or position, at most five', () => {
    state().addRecent(rynok);
    state().addRecent(dorosh);
    state().addRecent({ ...rynok, lat: 49.84191 }); // same address again
    expect(state().recent.map((p) => p.label)).toEqual([rynok.label, dorosh.label]);

    state().addRecent({ label: 'Dropped pin', lat: dorosh.lat, lng: dorosh.lng }); // same spot
    expect(state().recent.map((p) => p.label)).toEqual(['Dropped pin', rynok.label]);

    for (let i = 0; i < RECENT_LIMIT + 2; i++) {
      state().addRecent({ label: `Place ${i}`, lat: 49 + i / 10, lng: 24 });
    }
    expect(state().recent).toHaveLength(RECENT_LIMIT);
    expect(state().recent[0]?.label).toBe(`Place ${RECENT_LIMIT + 1}`);
  });

  it('edits a draft that only becomes the search area on commit', () => {
    state().startDraft();
    state().setDraftPlace(rynok);
    state().setDraftRadius(12);
    expect(state().selected).toBeNull();

    state().commitDraft();
    expect(state()).toMatchObject({ selected: rynok, radiusKm: 12 });
  });

  it('starts a draft from the committed area', () => {
    useLocation.setState({ selected: rynok, radiusKm: 8 });
    state().startDraft();
    expect(state().draft).toEqual({ place: rynok, radiusKm: 8 });
  });

  it('changes the Discover query key when the area changes, so distances refetch', () => {
    useLocation.setState({ selected: rynok, radiusKm: 5 });
    const before = nearbyKey();
    state().startDraft();
    state().setDraftPlace(dorosh);
    state().commitDraft();
    expect(nearbyKey()).not.toEqual(before);

    const moved = nearbyKey();
    state().startDraft();
    state().setDraftRadius(10);
    state().commitDraft();
    expect(nearbyKey()).not.toEqual(moved);
  });

  it('remembers each account’s area and recents, not the draft, and restores them on restart', async () => {
    state().switchUser('u1');
    state().addRecent(rynok);
    state().startDraft();
    state().setDraftPlace(dorosh);
    state().setDraftRadius(9);
    state().commitDraft();
    await Promise.resolve();

    const raw = (await AsyncStorage.getItem(LOCATION_STORAGE_KEY)) ?? '{}';
    expect(JSON.parse(raw).state).toEqual({
      byUser: { u1: { selected: dorosh, radiusKm: 9, recent: [rynok] } },
    });

    // Restart: a fresh copy of the store (not yet loaded) and of its storage. The session signs
    // in first; that must not overwrite the saved areas before they load.
    let fresh = useLocation;
    let freshStorage = AsyncStorage;
    jest.isolateModules(() => {
      fresh = require('./location').useLocation;
      const storage = require('@react-native-async-storage/async-storage');
      freshStorage = storage.default ?? storage;
    });
    await freshStorage.setItem(LOCATION_STORAGE_KEY, raw);
    fresh.getState().switchUser('u1');
    await fresh.persist.rehydrate();
    expect(fresh.getState()).toMatchObject({ selected: dorosh, radiusKm: 9, recent: [rynok] });
    expect(JSON.parse((await freshStorage.getItem(LOCATION_STORAGE_KEY)) ?? '{}').state).toEqual(
      JSON.parse(raw).state,
    );
  });

  it('restores the area whichever loads first: the session or the saved areas', async () => {
    await AsyncStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({
        state: { byUser: { u1: { selected: rynok, radiusKm: 7, recent: [] } } },
        version: 2,
      }),
    );
    await useLocation.persist.rehydrate();
    expect(state().selected).toBeNull();
    state().switchUser('u1');
    expect(state()).toMatchObject({ selected: rynok, radiusKm: 7 });
  });

  it('keeps an area through sign-out, and gives another account a fresh start', () => {
    state().switchUser('u1');
    state().startDraft();
    state().setDraftPlace(rynok);
    state().commitDraft();

    state().switchUser(null);
    expect(state().selected).toBeNull();

    state().switchUser('u2');
    expect(state()).toMatchObject({ selected: null, radiusKm: RADIUS_DEFAULT_KM, recent: [] });
    state().switchUser('u1');
    expect(state().selected).toEqual(rynok);
  });

  it('ignores an unreadable stored entry, and drops the old device-wide one', async () => {
    await AsyncStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({ state: { byUser: { u1: { selected: { lat: 'x' } } } }, version: 2 }),
    );
    await useLocation.persist.rehydrate();
    state().switchUser('u1');
    expect(state().selected).toBeNull();

    await AsyncStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({ state: { selected: rynok, radiusKm: 5, recent: [] }, version: 1 }),
    );
    await useLocation.persist.rehydrate();
    expect(state().byUser).toEqual({});
  });
});
