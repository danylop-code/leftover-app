import { StyleSheet } from 'react-native';
import { layout, radius, space } from '../../../shared/theme';

const TOAST_CLEARANCE = 72;

export const styles = StyleSheet.create({
  list: {
    gap: space[3],
    paddingTop: space[1],
    paddingHorizontal: layout.screenMargin,
    // Room for the floating Add bag button.
    paddingBottom: space[16] + space[8],
  },
  stats: { flexDirection: 'row', gap: 10, marginBottom: space[1] },
  skeletonStats: { height: 64, borderRadius: 14 },
  skeletonRow: { height: 88, borderRadius: radius.xl },
  centered: { flex: 1, justifyContent: 'center' },
  fab: { position: 'absolute', right: layout.screenMargin, bottom: space[4] },
  fabRaised: { bottom: space[4] + TOAST_CLEARANCE },
  toast: {
    position: 'absolute',
    left: layout.screenMargin,
    right: layout.screenMargin,
    bottom: space[4],
  },
  form: { gap: space[6], paddingTop: space[2], paddingBottom: space[8] },
  formCentered: { flex: 1, justifyContent: 'center' },
});
