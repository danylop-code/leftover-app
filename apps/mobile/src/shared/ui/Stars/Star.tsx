import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme';
import { ICON_VIEWBOX, starPath } from '../icons/glyphs';

type Props = { size: number; on: boolean };

export function Star({ size, on }: Props) {
  const { color } = useTheme();
  return (
    <Svg width={size} height={size} viewBox={ICON_VIEWBOX}>
      <Path d={starPath} fill={on ? color.star : color.starEmpty} />
    </Svg>
  );
}
