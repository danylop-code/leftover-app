import { StyleSheet } from 'react-native';
import { color, elevation, radius, space } from '../../../../shared/theme';

const LOGO = 44;

// Sizes from the DiscoverLoading artboard.
export const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...elevation[1],
  },
  media: { height: 132, borderRadius: 0 },
  body: { gap: 10, paddingTop: 30, paddingHorizontal: space[4], paddingBottom: space[4] },
  logo: {
    position: 'absolute',
    left: space[4],
    top: -LOGO / 2 - 2,
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    borderWidth: 3,
    borderColor: color.surface,
  },
  store: { width: '34%', height: 12 },
  storeCompact: { width: '28%', height: 12 },
  title: { width: '62%', height: 18 },
  titleCompact: { width: '54%', height: 18 },
  meta: { width: '46%', height: 14 },
  metaCompact: { width: '44%', height: 14 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space[2] },
  facts: { width: '30%', height: 14 },
  price: { width: '26%', height: 22 },
});
