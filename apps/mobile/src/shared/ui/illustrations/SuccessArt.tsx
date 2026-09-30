import Svg from 'react-native-svg';
import { ICON_VIEWBOX, icons } from '../icons/glyphs';
import { ShapeList } from '../icons/ShapeList';
import { useStyles } from './styles';

/** The big check on success states (`.empty-art.is-success`). */
export function SuccessArt() {
  const { success } = useStyles();
  return (
    <Svg
      width={success.size}
      height={success.size}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke={success.color}
      strokeWidth={success.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ShapeList shapes={icons.check} />
    </Svg>
  );
}
