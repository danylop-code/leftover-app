import { makeStyles, radius } from '../../theme';

// Photo placeholder heights from the design: card 132, row 88.
export const variants = {
  card: { height: 132, art: 76 },
  // StoreDetail's top image: taller, with thinner strokes on the larger glyph.
  hero: { height: 240, art: 120, stroke: 1.6 },
  row: { width: 88, height: 88, art: 48 },
  // Reserve's bag summary and My bags' rows.
  tile: { width: 72, height: 72, art: 40 },
  small: { width: 64, height: 64, art: 36 },
  thumb: { width: 56, height: 56, art: 32 },
} as const;

const highlight = 180;

export const useStyles = makeStyles(({ color, sheet }) => {
  const styles = sheet({
    root: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    card: { height: variants.card.height, alignSelf: 'stretch' },
    hero: { height: variants.hero.height, alignSelf: 'stretch' },
    row: { width: variants.row.width, height: variants.row.height, borderRadius: 14 },
    tile: { width: variants.tile.width, height: variants.tile.height, borderRadius: 14 },
    small: { width: variants.small.width, height: variants.small.height, borderRadius: 14 },
    thumb: { width: variants.thumb.width, height: variants.thumb.height, borderRadius: radius.md },
    // `.media::before`: soft light circle top-right.
    highlight: {
      position: 'absolute',
      width: highlight,
      height: highlight,
      borderRadius: highlight / 2,
      end: -50,
      top: -70,
      backgroundColor: color.mediaHighlight,
    },
  });
  return { styles };
});
