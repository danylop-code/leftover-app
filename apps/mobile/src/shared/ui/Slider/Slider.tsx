import { useRef, useState } from 'react';
import {
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  PanResponder,
  View,
} from 'react-native';
import { fraction, snap, valueAt } from './slider-math';
import { styles } from './styles';

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  valueText?: string;
};

const actions = [{ name: 'increment' }, { name: 'decrement' }] as const;

/** Range slider (`.range`): drag or tap the track; screen readers adjust by one step. */
export function Slider({ value, min, max, step = 1, onChange, label, valueText }: Props) {
  const [width, setWidth] = useState(0);
  // PanResponder is created once; read the latest props through a ref.
  const latest = useRef({ width, min, max, step, onChange, value });
  latest.current = { width, min, max, step, onChange, value };

  const emit = (x: number) => {
    const l = latest.current;
    const next = valueAt(x, l.width, l.min, l.max, l.step);
    if (next !== l.value) l.onChange(next);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => emit(e.nativeEvent.locationX),
      onPanResponderMove: (e) => emit(e.nativeEvent.locationX),
    }),
  ).current;

  const onAction = (e: AccessibilityActionEvent) => {
    const delta = e.nativeEvent.actionName === 'increment' ? step : -step;
    const next = snap(value + delta, min, max, step);
    if (next !== value) onChange(next);
  };

  const pct = `${fraction(value, min, max) * 100}%` as const;
  return (
    <View
      style={styles.root}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: valueText }}
      accessibilityActions={actions}
      onAccessibilityAction={onAction}
      {...responder.panHandlers}
    >
      <View style={styles.track} pointerEvents="none" />
      <View style={[styles.fill, { width: pct }]} pointerEvents="none" />
      <View style={[styles.thumb, { left: pct }]} pointerEvents="none" />
    </View>
  );
}
