import Svg from 'react-native-svg';
import { ICON_VIEWBOX, icons } from '../icons/glyphs';
import { ShapeList } from '../icons/ShapeList';
import { useStyles } from './styles';

/** The large crossed-out wifi glyph on error states (`.empty-art.is-danger`). */
export function OfflineArt() {
  const { offline } = useStyles();
  return (
    <Svg
      width={offline.size}
      height={offline.size}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke={offline.color}
      strokeWidth={offline.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ShapeList shapes={icons.wifiOff} />
    </Svg>
  );
}
