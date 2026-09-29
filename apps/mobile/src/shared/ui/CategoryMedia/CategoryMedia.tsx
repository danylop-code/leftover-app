import type { Category } from '@leftover/shared';
import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { useTheme } from '../../theme';
import { ART_VIEWBOX, categoryArt, ICON_STROKE_WIDTH } from '../icons/glyphs';
import { ShapeList } from '../icons/ShapeList';
import { Photo } from '../Photo/Photo';
import { mediaTint } from './media-tint';
import { useStyles, variants } from './styles';

type Props = {
  category: Category;
  variant?: keyof typeof variants;
  /** The real photo (20); the tint and glyph stay as its placeholder and fallback. */
  photo?: string | null;
  /** Overlays such as the stock badge or the save button. */
  children?: ReactNode;
  /** Size/shape overrides (e.g. the tilted tiles on Welcome). */
  style?: StyleProp<ViewStyle>;
};

/** A food photo, or its tinted placeholder with the category glyph (`.media-*`). */
export function CategoryMedia({ category, variant = 'card', photo, children, style }: Props) {
  const { styles } = useStyles();
  const { media } = useTheme();
  const tint = mediaTint[category];
  const size = variants[variant];
  const art = size.art;
  const stroke = 'stroke' in size ? size.stroke : ICON_STROKE_WIDTH;
  return (
    <View
      style={[styles.root, styles[variant], { backgroundColor: media[tint.bg] }, style]}
      accessibilityElementsHidden={!children}
    >
      <View style={styles.highlight} />
      <Svg
        width={art}
        height={art}
        viewBox={ART_VIEWBOX}
        fill="none"
        stroke={media[tint.ink]}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ShapeList shapes={categoryArt[category]} />
      </Svg>
      <Photo src={photo} />
      {children}
    </View>
  );
}
