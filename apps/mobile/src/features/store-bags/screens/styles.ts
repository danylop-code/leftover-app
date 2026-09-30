import { layout, makeStyles, radius, space } from '../../../shared/theme';

const TOAST_CLEARANCE = 72;
/** Room under the list for the floating Add bag button. */
export const FAB_CLEARANCE = space[16] + space[8];

export const useStyles = makeStyles(({ sheet }) => {
  const styles = sheet({
    list: {
      gap: space[3],
      paddingTop: space[1],
      paddingHorizontal: layout.screenMargin,
      paddingBottom: FAB_CLEARANCE,
    },
    stats: { flexDirection: 'row', gap: 10, marginBottom: space[1] },
    skeletonStats: { height: 64, borderRadius: 14 },
    skeletonRow: { height: 88, borderRadius: radius.xl },
    centered: { flex: 1, justifyContent: 'center' },
    fab: { position: 'absolute', end: layout.screenMargin, bottom: space[4] },
    fabRaised: { bottom: space[4] + TOAST_CLEARANCE },
    toast: {
      position: 'absolute',
      start: layout.screenMargin,
      end: layout.screenMargin,
      bottom: space[4],
    },
    form: { gap: space[6], paddingTop: space[2], paddingBottom: space[8] },
    formCentered: { flex: 1, justifyContent: 'center' },
  });
  return { styles };
});
