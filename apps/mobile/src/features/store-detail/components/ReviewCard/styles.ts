import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../../shared/theme';

const AVATAR = 36;

export const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: space[4],
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  initial: { fontFamily: fontFamily.body['700'], fontSize: 13, color: color.primary },
  who: { flex: 1 },
  name: { ...typography.label, color: color.textPrimary },
  when: { ...typography.caption, color: color.textSecondary },
  text: { ...typography.body, fontSize: 15, lineHeight: 22, color: color.textPrimary },
});
