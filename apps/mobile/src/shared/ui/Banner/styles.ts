import { StyleSheet } from 'react-native';
import { color, fontFamily, radius, space } from '../../theme';

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: space[3],
    paddingVertical: 14,
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
  },
  icon: { marginTop: 2 },
  body: { flex: 1, gap: 2 },
  title: {
    fontFamily: fontFamily.body['700'],
    fontSize: 15,
    lineHeight: 20,
    color: color.textPrimary,
  },
  text: {
    fontFamily: fontFamily.body['400'],
    fontSize: 14,
    lineHeight: 20,
    color: color.textPrimary,
  },
});

export const tones = {
  info: { bg: color.primarySoft, icon: color.primary },
  danger: { bg: color.dangerSoft, icon: color.danger },
  warning: { bg: color.warningSoft, icon: color.warning },
} as const;
