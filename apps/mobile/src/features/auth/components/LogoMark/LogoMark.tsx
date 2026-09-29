import Svg, { Path, Rect } from 'react-native-svg';
import { mark } from './styles';

type Props = { size: number };

export function LogoMark({ size }: Props) {
  const { handle, body, smile, leaf } = mark;
  return (
    <Svg width={size} height={size} viewBox={mark.viewBox} accessible={false}>
      <Path
        d={handle.d}
        fill="none"
        stroke={handle.color}
        strokeWidth={handle.strokeWidth}
        strokeLinecap="round"
      />
      <Rect
        x={body.x}
        y={body.y}
        width={body.width}
        height={body.height}
        rx={body.rx}
        fill={body.color}
      />
      <Path
        d={smile.d}
        fill="none"
        stroke={smile.color}
        strokeWidth={smile.strokeWidth}
        strokeLinecap="round"
      />
      <Path d={leaf.d} fill={leaf.color} />
    </Svg>
  );
}
