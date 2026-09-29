import { StyleSheet } from 'react-native';
import { color, space, typography } from '../../theme';

const art = 144;

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[8],
    paddingHorizontal: space[6],
  },
  art: {
    width: art,
    height: art,
    borderRadius: art / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  title: { ...typography.title, color: color.textPrimary, textAlign: 'center' },
  text: { ...typography.body, color: color.textSecondary, textAlign: 'center', maxWidth: 290 },
  actions: { alignSelf: 'stretch', alignItems: 'center', gap: space[2], marginTop: space[2] },
});

export const artBg = {
  default: color.primarySoft,
  danger: color.dangerSoft,
  success: color.successSoft,
} as const;
