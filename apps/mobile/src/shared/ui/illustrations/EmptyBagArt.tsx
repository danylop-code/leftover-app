import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { art } from './styles';

/** The smiling bag with a leaf (`.empty-art` on DiscoverEmpty and the other empty states). */
export function EmptyBagArt() {
  const { colors, bag } = art;
  const line = { fill: 'none', stroke: colors.ink, strokeWidth: art.stroke } as const;
  return (
    <Svg width={art.size} height={art.size} viewBox={art.viewBox} accessible={false}>
      <Path d={art.handle} {...line} strokeLinecap="round" />
      <Rect
        x={bag.x}
        y={bag.y}
        width={bag.width}
        height={bag.height}
        rx={bag.rx}
        {...line}
        fill={colors.bag}
      />
      {art.eyes.map((eye) => (
        <Circle key={eye.cx} cx={eye.cx} cy={eye.cy} r={art.eyeRadius} fill={colors.ink} />
      ))}
      <Path d={art.smile} {...line} strokeLinecap="round" />
      <Path d={art.leaf} fill={colors.leaf} />
    </Svg>
  );
}
