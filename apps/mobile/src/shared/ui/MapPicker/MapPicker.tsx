import type { LatLng } from '@leftover/shared';
import { useEffect, useRef } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import MapView, {
  Circle,
  type MapPressEvent,
  Marker,
  type MarkerDragStartEndEvent,
} from 'react-native-maps';
import { METERS_PER_KM } from '../../constants/map';
import { regionFor } from './map-region';
import { circle, pinColor, styles } from './styles';

type Props = {
  value: LatLng;
  onChange: (next: LatLng) => void;
  /** Accessible name for the map. */
  label: string;
  /** Draws the search-radius circle around the pin (05). */
  radiusKm?: number;
  style?: StyleProp<ViewStyle>;
};

const toLatLng = (c: { latitude: number; longitude: number }): LatLng => ({
  lat: c.latitude,
  lng: c.longitude,
});

/**
 * Map with a draggable pin: drag it or tap the map to move it. Recentres when `value` changes
 * from outside (e.g. after geocoding). Native only — brief 17 adds a web sibling.
 */
export function MapPicker({ value, onChange, label, radiusKm, style }: Props) {
  const ref = useRef<MapView>(null);
  const initialRegion = useRef(regionFor(value, radiusKm)).current;
  const lastEmitted = useRef<LatLng | null>(null);
  const lastRadius = useRef(radiusKm);

  useEffect(() => {
    const emitted = lastEmitted.current;
    const radiusChanged = lastRadius.current !== radiusKm;
    lastRadius.current = radiusKm;
    // Moves we reported ourselves are already on screen; only follow outside changes, and
    // reframe when the radius changes so the circle stays in view.
    if (!radiusChanged && emitted && emitted.lat === value.lat && emitted.lng === value.lng) return;
    ref.current?.animateToRegion(regionFor(value, radiusKm));
  }, [value, radiusKm]);

  const emit = (next: LatLng) => {
    lastEmitted.current = next;
    onChange(next);
  };

  const coordinate = { latitude: value.lat, longitude: value.lng };
  return (
    <View
      style={[styles.root, style]}
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
    >
      <MapView
        ref={ref}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={(e: MapPressEvent) => emit(toLatLng(e.nativeEvent.coordinate))}
        toolbarEnabled={false}
      >
        {radiusKm ? (
          <Circle
            center={coordinate}
            radius={radiusKm * METERS_PER_KM}
            fillColor={circle.fill}
            strokeColor={circle.stroke}
            strokeWidth={circle.strokeWidth}
          />
        ) : null}
        <Marker
          coordinate={coordinate}
          draggable
          pinColor={pinColor}
          onDragEnd={(e: MarkerDragStartEndEvent) => emit(toLatLng(e.nativeEvent.coordinate))}
        />
      </MapView>
    </View>
  );
}
