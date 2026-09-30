import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { type Insets, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { tapMin } from '../theme';
import {
  Button,
  Chip,
  IconButton,
  ListRow,
  Segmented,
  Slider,
  Stars,
  Stepper,
  Switch,
  TabBar,
  Toast,
} from '.';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const noop = () => {};

const cases: [string, ReactElement][] = [
  ['Button', <Button key="b" label="Reserve" onPress={noop} />],
  ['Button sm', <Button key="bs" label="View" size="sm" onPress={noop} />],
  ['IconButton', <IconButton key="i" icon="back" label="Back" onPress={noop} />],
  ['IconButton sm', <IconButton key="is" icon="close" label="Clear" size="sm" onPress={noop} />],
  ['Chip', <Chip key="c" label="Bakery" onPress={noop} />],
  ['Stepper', <Stepper key="st" value={2} min={1} max={3} onChange={noop} />],
  ['Switch', <Switch key="sw" value label="Show to customers" onValueChange={noop} />],
  ['Slider', <Slider key="sl" value={5} min={1} max={30} label="Search radius" onChange={noop} />],
  [
    'Segmented',
    <Segmented
      key="sg"
      value="current"
      onChange={noop}
      options={[
        { value: 'current', label: 'Current', count: 2 },
        { value: 'past', label: 'Past' },
      ]}
    />,
  ],
  ['Stars md', <Stars key="s1" mode="input" value={3} onChange={noop} />],
  ['Stars sm', <Stars key="s2" mode="input" size="sm" value={3} onChange={noop} />],
  ['Stars lg', <Stars key="s3" mode="input" size="lg" value={3} onChange={noop} />],
  ['ListRow', <ListRow key="l" label="Log out" icon="logout" onPress={noop} />],
  [
    'TabBar',
    <TabBar
      key="t"
      items={[
        { key: 'd', label: 'Discover', icon: 'discover', active: true, onPress: noop },
        { key: 'o', label: 'Orders', icon: 'orders', active: false, onPress: noop },
      ]}
    />,
  ],
  ['Toast', <Toast key="to" message="Bag paused" action={{ label: 'Undo', onPress: noop }} />],
];

const interactiveRoles = ['button', 'switch', 'tab', 'adjustable'];

const extent = (style: unknown, slop: Insets | number | undefined, axis: 'height' | 'width') => {
  const s: ViewStyle = StyleSheet.flatten(style as ViewStyle) ?? {};
  const drawn = (s[axis] ?? s[axis === 'height' ? 'minHeight' : 'minWidth']) as number | undefined;
  const pad =
    typeof slop === 'number'
      ? slop * 2
      : axis === 'height'
        ? (slop?.top ?? 0) + (slop?.bottom ?? 0)
        : (slop?.left ?? 0) + (slop?.right ?? 0);
  return drawn === undefined ? undefined : drawn + pad;
};

describe.each(cases)('%s', (_name, element) => {
  beforeEach(() => {
    render(<SafeAreaProvider initialMetrics={metrics}>{element}</SafeAreaProvider>);
  });

  it('exposes an interactive role', () => {
    const found = interactiveRoles.flatMap((role) => screen.queryAllByRole(role));
    expect(found.length).toBeGreaterThan(0);
  });

  it('has a hit area of at least tapMin', () => {
    const found = interactiveRoles.flatMap((role) => screen.queryAllByRole(role));
    for (const el of found) {
      const height = extent(el.props.style, el.props.hitSlop, 'height');
      expect(height).toBeGreaterThanOrEqual(tapMin);
      const width = extent(el.props.style, el.props.hitSlop, 'width');
      if (width !== undefined) expect(width).toBeGreaterThanOrEqual(tapMin);
    }
  });
});
