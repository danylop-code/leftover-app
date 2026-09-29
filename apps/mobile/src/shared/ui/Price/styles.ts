import { StyleSheet } from 'react-native';
import { color, fontFamily, space } from '../../theme';

export const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
  old: {
    fontFamily: fontFamily.body['500'],
    fontSize: 13,
    lineHeight: 16,
    color: color.textSecondary,
    textDecorationLine: 'line-through',
  },
  sale: {
    fontFamily: fontFamily.display['600'],
    fontSize: 22,
    lineHeight: 26,
    color: color.accent,
  },
  saleLg: { fontSize: 30, lineHeight: 34 },
  soldOut: { color: color.textSecondary },
});
