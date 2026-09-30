// Jest stand-in for react-native-maps (registered in jest.setup.ts): plain Views that keep the
// props, so tests can read coordinates and fire onPress/onDragEnd.
import { forwardRef, useImperativeHandle } from 'react';
import { View, type ViewProps } from 'react-native';

// Callers type-check against the real library; the mock just forwards every prop.
type AnyProps = ViewProps;

export const animateToRegion = jest.fn();

const MapView = forwardRef<unknown, AnyProps>(function MapView({ children, ...props }, ref) {
  useImperativeHandle(ref, () => ({ animateToRegion }));
  return (
    <View testID="map" {...props}>
      {children}
    </View>
  );
});

export const Marker = (props: AnyProps) => <View testID="map-marker" {...props} />;
export const Circle = (props: AnyProps) => <View testID="map-circle" {...props} />;
export const PROVIDER_DEFAULT = undefined;
export default MapView;
