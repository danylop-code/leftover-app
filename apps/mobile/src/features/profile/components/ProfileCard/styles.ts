import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../../shared/theme';

const AVATAR = 56;

// Settings artboard: the profile `.card` with the initials avatar and stat tiles.
export const styles = StyleSheet.create({
  card: {
    gap: space[4],
    padding: space[4],
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.accentSoft,
  },
  initials: {
    fontFamily: fontFamily.display['600'],
    fontSize: 22,
    lineHeight: 26,
    color: color.accentPressed,
  },
  text: { flex: 1, minWidth: 0 },
  name: { ...typography.heading, color: color.textPrimary },
  email: { ...typography.label, fontFamily: fontFamily.body['500'], color: color.textSecondary },
  stats: { flexDirection: 'row', gap: 10 },
});
