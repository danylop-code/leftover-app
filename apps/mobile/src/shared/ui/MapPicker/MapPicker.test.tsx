import { fireEvent, render, screen } from '@testing-library/react-native';
import { animateToRegion } from '../../testing/react-native-maps-mock';
import { map } from '../../theme';
import { MapPicker } from './MapPicker';

const here = { lat: 49.8393, lng: 24.0325 };

describe('MapPicker', () => {
  beforeEach(() => animateToRegion.mockClear());

  it('puts the pin at the value', () => {
    render(<MapPicker value={here} onChange={jest.fn()} label="Shop location" />);
    expect(screen.getByTestId('map-marker')).toHaveProp('coordinate', {
      latitude: here.lat,
      longitude: here.lng,
    });
    expect(screen.getByLabelText('Shop location')).toBeOnTheScreen();
  });

  it('reports the new position when the pin is dragged', () => {
    const onChange = jest.fn();
    render(<MapPicker value={here} onChange={onChange} label="Shop location" />);
    fireEvent(screen.getByTestId('map-marker'), 'dragEnd', {
      nativeEvent: { coordinate: { latitude: 49.85, longitude: 24.04 } },
    });
    expect(onChange).toHaveBeenCalledWith({ lat: 49.85, lng: 24.04 });
  });

  it('moves the pin where the map is tapped', () => {
    const onChange = jest.fn();
    render(<MapPicker value={here} onChange={onChange} label="Shop location" />);
    fireEvent.press(screen.getByTestId('map'), {
      nativeEvent: { coordinate: { latitude: 49.83, longitude: 24.02 } },
    });
    expect(onChange).toHaveBeenCalledWith({ lat: 49.83, lng: 24.02 });
  });

  it('draws the radius circle in metres when a radius is given', () => {
    const { rerender } = render(<MapPicker value={here} onChange={jest.fn()} label="Area" />);
    expect(screen.queryByTestId('map-circle')).toBeNull();
    rerender(<MapPicker value={here} onChange={jest.fn()} label="Area" radiusKm={5} />);
    const circle = screen.getByTestId('map-circle');
    expect(circle).toHaveProp('radius', 5000);
    expect(circle).toHaveProp('fillColor', map.radiusFill);
  });

  it('recentres when the value changes from outside', () => {
    const { rerender } = render(
      <MapPicker value={here} onChange={jest.fn()} label="Shop location" />,
    );
    rerender(
      <MapPicker value={{ lat: 50.45, lng: 30.52 }} onChange={jest.fn()} label="Shop location" />,
    );
    expect(animateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 50.45, longitude: 30.52 }),
    );
  });

  it('reframes when the radius changes after the pin was dragged', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <MapPicker value={here} onChange={onChange} label="Area" radiusKm={5} />,
    );
    const dragged = { latitude: 49.85, longitude: 24.04 };
    fireEvent(screen.getByTestId('map-marker'), 'dragEnd', {
      nativeEvent: { coordinate: dragged },
    });
    const next = { lat: dragged.latitude, lng: dragged.longitude };
    rerender(<MapPicker value={next} onChange={onChange} label="Area" radiusKm={5} />);
    animateToRegion.mockClear();

    rerender(<MapPicker value={next} onChange={onChange} label="Area" radiusKm={12} />);
    expect(animateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 49.85, longitude: 24.04 }),
    );
  });
});
