import Svg from 'react-native-svg';
import { iconSize, useTheme } from '../../theme';
import { ICON_STROKE_WIDTH, ICON_VIEWBOX, type IconName, icons } from './glyphs';
import { ShapeList } from './ShapeList';
import { useStyles } from './styles';

// Glyphs that point along the reading direction and flip right-to-left.
const DIRECTIONAL: readonly IconName[] = ['back', 'chevronRight', 'logout'];

type Props = {
  name: IconName;
  size?: keyof typeof iconSize;
  color?: string;
  strokeWidth?: number;
  /** Fills the shape too (the saved heart). */
  fill?: string;
};

/** Decorative stroke icon. Give the pressable around it the accessible label. */
export function Icon({ name, size = 'md', color, strokeWidth, fill = 'none' }: Props) {
  const theme = useTheme();
  const { styles } = useStyles();
  const px = iconSize[size];
  const mirrored = theme.direction === 'rtl' && DIRECTIONAL.includes(name);
  return (
    <Svg
      width={px}
      height={px}
      viewBox={ICON_VIEWBOX}
      fill={fill}
      stroke={color ?? theme.color.textPrimary}
      style={mirrored ? styles.mirrored : undefined}
      strokeWidth={strokeWidth ?? ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={`icon-${name}`}
    >
      <ShapeList shapes={icons[name]} />
    </Svg>
  );
}
