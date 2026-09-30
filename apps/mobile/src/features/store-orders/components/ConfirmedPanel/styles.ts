import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, radius, space, typography } from '../../../../shared/theme';

const CHECK = 56;

// StoreCodeSuccess: a success-ringed `.card`.
export const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 10,
    paddingTop: space[5],
    paddingHorizontal: space[4],
    paddingBottom: space[4],
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: color.success,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  check: {
    width: CHECK,
    height: CHECK,
    borderRadius: CHECK / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.success,
  },
  title: { ...typography.title, color: color.textPrimary, textAlign: 'center' },
  text: { ...typography.body, color: color.textSecondary, textAlign: 'center' },
  strong: { fontFamily: fontFamily.body['700'], color: color.textPrimary },
  payment: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: 14,
    backgroundColor: color.accentSoft,
  },
  paymentLabel: { ...typography.label, color: color.accentPressed },
  paymentAmount: { ...typography.title, color: color.accentPressed },
  next: { alignSelf: 'stretch', marginTop: space[1] },
});

export const checkColor = color.onPrimary;
export const checkStroke = 2.6;
