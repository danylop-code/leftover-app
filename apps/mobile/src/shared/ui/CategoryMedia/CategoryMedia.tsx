import type { Category } from '@leftover/shared';
import type { ReactNode } from 'react';
import { View } from 'react-native';
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
};

/** Tinted food-photo placeholder with the category glyph (`.media-*`). */
export function CategoryMedia({ category, variant = 'card', children }: Props) {
  const tint = mediaTint[category];
  const art = variants[variant].art;
  return (
    <View
      style={[styles.root, styles[variant], { backgroundColor: media[tint.bg] }]}
      accessibilityElementsHidden={!children}
    >
      <View style={styles.highlight} />
      <Svg
        width={art}
        height={art}
        viewBox={ART_VIEWBOX}
        fill="none"
        stroke={media[tint.ink]}
        strokeWidth={ICON_STROKE_WIDTH}
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
