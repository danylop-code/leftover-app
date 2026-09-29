import { StyleSheet } from 'react-native';
import { color, elevation, radius, space, typography } from '../../../../shared/theme';

const CLOCK = 44;

export const styles = StyleSheet.create({
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    ...elevation[1],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  clock: {
    width: CLOCK,
    height: CLOCK,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  caption: { ...typography.caption, color: color.textSecondary },
  headline: { ...typography.title, color: color.textPrimary },
  when: { alignItems: 'flex-end' },
  range: { ...typography.label, color: color.textPrimary },
});

export const clockColors = {
  soon: { bg: color.accentSoft, fg: color.accentPressed },
  ready: { bg: color.successSoft, fg: color.success },
  missed: { bg: color.warningSoft, fg: color.warning },
} as const;
