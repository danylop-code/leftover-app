import { StyleSheet } from 'react-native';
import { color, elevation, layout, radius, space } from '../../../shared/theme';

export const styles = StyleSheet.create({
  list: { gap: space[3], paddingTop: space[3], paddingHorizontal: layout.screenMargin },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingRight: space[3],
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  row: { flex: 1, minWidth: 0 },
  skeleton: { height: 72, borderRadius: radius.xl },
  centered: { flex: 1, justifyContent: 'center' },
  toast: { position: 'absolute', left: layout.screenMargin, right: layout.screenMargin },
});
