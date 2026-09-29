import type { Category } from '@leftover/shared';
import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { media } from '../../theme';
import { ART_VIEWBOX, categoryArt, ICON_STROKE_WIDTH } from '../icons/glyphs';
import { ShapeList } from '../icons/ShapeList';
import { mediaTint } from './media-tint';
import { styles, variants } from './styles';

type Props = {
  category: Category;
  variant?: keyof typeof variants;
  /** Overlays such as the stock badge or the save button. */
  children?: ReactNode;
  /** Size/shape overrides (e.g. the tilted tiles on Welcome). */
  style?: StyleProp<ViewStyle>;
};

/** Tinted food-photo placeholder with the category glyph (`.media-*`). */
export function CategoryMedia({ category, variant = 'card', children, style }: Props) {
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
        accessible={false}
      >
        <ShapeList shapes={categoryArt[category]} />
      </Svg>
      {children}
    </View>
  );
}
