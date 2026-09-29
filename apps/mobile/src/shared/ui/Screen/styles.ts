import { StyleSheet } from 'react-native';
import { color, layout } from '../../theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.background },
  padded: { paddingHorizontal: layout.screenMargin },
  scroll: { flexGrow: 1, gap: layout.cardGap },
});
