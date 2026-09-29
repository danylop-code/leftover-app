import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../../shared/theme';

const PIN = 40;

// `.card` with `.loc-pin`, the address (`.t-label` at 15 px) and the distance caption.
export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: 14,
    paddingLeft: space[4],
    paddingRight: 14,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  pin: {
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  text: { flex: 1, minWidth: 0 },
  address: {
    fontFamily: fontFamily.body['600'],
    fontSize: 15,
    lineHeight: 20,
    color: color.textPrimary,
  },
  distance: { ...typography.caption, color: color.textSecondary },
});

export const pinColor = color.primary;
