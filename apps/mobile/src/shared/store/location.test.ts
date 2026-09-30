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
  return keys.nearby(area);
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

  it('persists the area and recents (not the draft) and restores them on restart', async () => {
    state().addRecent(rynok);
    state().startDraft();
    state().setDraftPlace(dorosh);
    state().setDraftRadius(9);
    state().commitDraft();
    await Promise.resolve();

    const raw = (await AsyncStorage.getItem(LOCATION_STORAGE_KEY)) ?? '{}';
    expect(JSON.parse(raw).state).toEqual({ selected: dorosh, radiusKm: 9, recent: [rynok] });

    // Restart: memory starts empty (resetting it also writes, so put the saved entry back).
    useLocation.setState({ selected: null, radiusKm: RADIUS_DEFAULT_KM, recent: [] });
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, raw);
    await useLocation.persist.rehydrate();
    expect(state()).toMatchObject({ selected: dorosh, radiusKm: 9, recent: [rynok] });
  });

  it('ignores an unreadable stored entry', async () => {
    await AsyncStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({ state: { selected: { lat: 'x' }, radiusKm: 99 }, version: 1 }),
    );
    await useLocation.persist.rehydrate();
    expect(state()).toMatchObject({ selected: null, radiusKm: RADIUS_DEFAULT_KM, recent: [] });
  });

  it('clear() forgets everything on this device', async () => {
    useLocation.setState({ selected: rynok, radiusKm: 12, recent: [rynok] });
    state().clear();
    await Promise.resolve();
    expect(state()).toMatchObject({ selected: null, radiusKm: RADIUS_DEFAULT_KM, recent: [] });
    expect(JSON.parse((await AsyncStorage.getItem(LOCATION_STORAGE_KEY)) ?? '{}').state).toEqual({
      selected: null,
      radiusKm: RADIUS_DEFAULT_KM,
      recent: [],
    });
  });
});
