import Svg, { Path } from 'react-native-svg';
import { color } from '../../theme';
import { ICON_VIEWBOX, starPath } from '../icons/glyphs';

type Props = { size: number; on: boolean };

export function Star({ size, on }: Props) {
  return (
    <Svg width={size} height={size} viewBox={ICON_VIEWBOX} accessible={false}>
      <Path d={starPath} fill={on ? color.star : color.starEmpty} />
    </Svg>
  );
}
