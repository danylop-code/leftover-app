import { StyleSheet } from 'react-native';
import { color, fontFamily } from '../../theme';

export const sizes = { md: 44, lg: 64 } as const;

export const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  md: { width: sizes.md, height: sizes.md, borderRadius: sizes.md / 2 },
  lg: { width: sizes.lg, height: sizes.lg, borderRadius: sizes.lg / 2 },
  ring: { borderWidth: 3, borderColor: color.surface },
  letter: { fontFamily: fontFamily.display['600italic'], color: color.onPrimary },
  letterMd: { fontSize: 18, lineHeight: 22 },
  letterLg: { fontSize: 26, lineHeight: 30 },
});
