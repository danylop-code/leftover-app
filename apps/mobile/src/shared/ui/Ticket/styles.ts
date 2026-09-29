import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../theme';

const notch = 24;

export const styles = StyleSheet.create({
  ticket: { backgroundColor: color.surface, borderRadius: radius.xl, ...elevation[2] },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    height: 48,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: color.primary,
  },
  bandText: { ...typography.label, color: color.onPrimary },
  main: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 22,
    paddingHorizontal: space[5],
    paddingBottom: space[4],
  },
  code: {
    fontFamily: fontFamily.display['600'],
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: 11.5,
    paddingLeft: 11.5,
    color: color.primary,
    textAlign: 'center',
  },
  cut: { height: notch, justifyContent: 'center' },
  dash: {
    marginHorizontal: space[6],
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: color.border,
  },
  notch: {
    position: 'absolute',
    top: 0,
    width: notch,
    height: notch,
    borderRadius: notch / 2,
    backgroundColor: color.background,
  },
  notchLeft: { left: -notch / 2 },
  notchRight: { right: -notch / 2 },
  bottom: { paddingTop: space[3], paddingHorizontal: space[4], paddingBottom: 18 },
});

export const bandIconColor = color.onPrimary;
