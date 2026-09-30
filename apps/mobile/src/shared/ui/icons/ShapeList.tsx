import { Circle, Path, Rect } from 'react-native-svg';
import type { Shape } from './glyphs';

type Props = { shapes: readonly Shape[] };

export function ShapeList({ shapes }: Props) {
  return shapes.map((s, i) => {
    const key = `${i}`;
    if ('d' in s) return <Path key={key} d={s.d} />;
    if ('circle' in s) {
      const [cx, cy, r] = s.circle;
      return <Circle key={key} cx={cx} cy={cy} r={r} />;
    }
    const [x, y, width, height, rx] = s.rect;
    return <Rect key={key} x={x} y={y} width={width} height={height} rx={rx} />;
  });
}
