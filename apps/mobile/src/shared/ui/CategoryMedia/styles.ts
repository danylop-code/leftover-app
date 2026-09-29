import { StyleSheet } from 'react-native';
import { color, radius } from '../../theme';

// Photo placeholder heights from the design: card 132, row 88.
export const variants = {
  card: { height: 132, art: 76 },
  row: { width: 88, height: 88, art: 48 },
  thumb: { width: 56, height: 56, art: 32 },
} as const;

const highlight = 180;

export const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  card: { height: variants.card.height, alignSelf: 'stretch' },
  row: { width: variants.row.width, height: variants.row.height, borderRadius: 14 },
  thumb: { width: variants.thumb.width, height: variants.thumb.height, borderRadius: radius.md },
  // `.media::before`: soft light circle top-right.
  highlight: {
    position: 'absolute',
    width: highlight,
    height: highlight,
    borderRadius: highlight / 2,
    right: -50,
    top: -70,
    backgroundColor: color.mediaHighlight,
  },
});
