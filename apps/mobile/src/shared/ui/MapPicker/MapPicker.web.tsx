import type { LatLng } from '@leftover/shared';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { METERS_PER_KM } from '../../constants/map';
import { tiles, useStyles, zoomFor } from './styles';

type Props = {
  value: LatLng;
  onChange: (next: LatLng) => void;
  label: string;
  radiusKm?: number;
  style?: StyleProp<ViewStyle>;
};

// A round pin drawn with CSS: Leaflet's default marker images don't survive bundling.
const pinIconFor = (pinColor: string, pinBorder: string, pinShadow: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:${pinColor};box-shadow:0 4px 10px ${pinShadow};border:3px solid ${pinBorder}"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

/** Follows `value`/`radiusKm` changes from outside (search, current position, the slider). */
function Recenter({ value, radiusKm }: { value: LatLng; radiusKm?: number }) {
  const map = useMap();
  const last = useRef('');
  useEffect(() => {
    const key = `${value.lat},${value.lng},${radiusKm ?? ''}`;
    if (key === last.current) return;
    last.current = key;
    map.setView([value.lat, value.lng], zoomFor(radiusKm));
  }, [map, value, radiusKm]);
  return null;
}

function TapToMove({ onChange }: { onChange: (next: LatLng) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/**
 * Web sibling of MapPicker (brief 17): an OpenStreetMap map (Leaflet) with the same draggable
 * pin, tap-to-move and radius circle.
 */
export function MapPicker({ value, onChange, label, radiusKm, style }: Props) {
  const { circle, pin, styles } = useStyles();
  const pinIcon = useMemo(() => pinIconFor(pin.fill, pin.border, pin.shadow), [pin]);
  const center = useMemo(() => [value.lat, value.lng] as [number, number], [value]);
  return (
    <View
      style={[styles.root, style]}
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
    >
      <MapContainer
        center={center}
        zoom={zoomFor(radiusKm)}
        style={tiles.container}
        zoomControl={false}
      >
        <TileLayer url={tiles.url} attribution={tiles.attribution} />
        <Recenter value={value} radiusKm={radiusKm} />
        <TapToMove onChange={onChange} />
        {radiusKm ? (
          <Circle
            center={center}
            radius={radiusKm * METERS_PER_KM}
            pathOptions={{
              color: circle.stroke,
              fillColor: circle.fill,
              fillOpacity: 1,
              weight: circle.strokeWidth,
            }}
          />
        ) : null}
        <Marker
          position={center}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              onChange({ lat, lng });
            },
          }}
        />
      </MapContainer>
    </View>
  );
}
