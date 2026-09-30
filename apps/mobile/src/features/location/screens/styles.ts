import { StyleSheet } from 'react-native';
import {
  color,
  elevation,
  fontFamily,
  layout,
  radius,
  space,
  tapMin,
  typography,
} from '../../../shared/theme';
import { INPUT_HEIGHT } from '../../../shared/ui/Field/styles';

// Location artboard: the map fills the screen; the top bar and the sheet float over it.
export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.background },
  map: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    height: '100%',
    borderRadius: 0,
  },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
  },
  // `.input-wrap.no-border` as a pill: opens LocationSearch.
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: INPUT_HEIGHT,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    ...elevation[2],
  },
  pressed: { opacity: 0.85 },
  searchText: { ...typography.body, color: color.textSecondary },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  locate: { alignSelf: 'flex-end', marginRight: space[4], marginBottom: space[4] },
  // `.sheet` + `.sheet-grab`
  sheet: {
    gap: space[4],
    paddingTop: 10,
    paddingHorizontal: layout.screenMargin,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    ...elevation[3],
  },
  grab: {
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: color.border,
    alignSelf: 'center',
    marginBottom: space[1],
  },
  title: { ...typography.title, color: color.textPrimary },

  // LocationSearch artboard.
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingTop: space[1],
    paddingBottom: space[3],
    paddingHorizontal: space[4],
  },
  back: { marginLeft: -space[2] },
  searchField: { flex: 1 },
  clear: { marginRight: -space[3] },
  searchContent: { gap: space[5], paddingTop: space[1], paddingBottom: space[10] },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: tapMin,
    paddingHorizontal: space[1],
  },
  currentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  currentLabel: {
    fontFamily: fontFamily.body['700'],
    fontSize: 16,
    lineHeight: 22,
    color: color.primary,
  },
  status: { ...typography.body, color: color.textSecondary, paddingHorizontal: space[1] },
});

/** The top bar sits just under the status bar (52 px on the artboard's 47 px inset). */
export const topPadding = (insetTop: number) => ({ paddingTop: insetTop + space[1] });
/** The sheet clears the home indicator (34 px on the artboard). */
export const sheetPadding = (insetBottom: number) => ({
  paddingBottom: Math.max(insetBottom, space[5]),
});

export const locateColor = color.primary;
export const searchIconColor = color.textSecondary;
export const clearColor = color.textSecondary;
