import Svg from 'react-native-svg';
import { iconSize, color as palette } from '../../theme';
import { ICON_STROKE_WIDTH, ICON_VIEWBOX, type IconName, icons } from './glyphs';
import { ShapeList } from './ShapeList';

type Props = {
  name: IconName;
  size?: keyof typeof iconSize;
  color?: string;
  strokeWidth?: number;
  /** Fills the shape too (the saved heart). */
  fill?: string;
};

/** Decorative stroke icon. Give the pressable around it the accessible label. */
export function Icon({
  name,
  size = 'md',
  color = palette.textPrimary,
  strokeWidth,
  fill = 'none',
}: Props) {
  const px = iconSize[size];
  return (
    <Svg
      width={px}
      height={px}
      viewBox={ICON_VIEWBOX}
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth ?? ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
      testID={`icon-${name}`}
    >
      <ShapeList shapes={icons[name]} />
    </Svg>
  );
}
