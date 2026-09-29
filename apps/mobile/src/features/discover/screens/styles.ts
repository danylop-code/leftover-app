import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, layout, space, typography } from '../../../shared/theme';
import { PILL_HEIGHT } from '../components/LocationPill/styles';

// Discover artboard: pill row, title, chips, then the list (`.content` with `padding-top: 20px`).
export const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingTop: space[1],
    paddingHorizontal: space[4],
  },
  // The map button matches the pill's height.
  mapButton: { width: PILL_HEIGHT, height: PILL_HEIGHT, ...elevation[1] },
  title: {
    ...typography.title,
    color: color.textPrimary,
    paddingTop: space[5],
    paddingHorizontal: layout.screenMargin,
    paddingBottom: space[3],
  },
  list: {
    gap: layout.cardGap,
    paddingTop: space[5],
    paddingHorizontal: layout.screenMargin,
    paddingBottom: space[6],
  },
  // `.section-h`
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space[3],
  },
  sectionTitle: { ...typography.heading, color: color.textPrimary },
  sectionStatus: {
    ...typography.label,
    fontFamily: fontFamily.body['500'],
    color: color.textSecondary,
  },
  centered: { flex: 1, justifyContent: 'center' },
  toast: {
    position: 'absolute',
    left: layout.screenMargin,
    right: layout.screenMargin,
    bottom: space[4],
  },
});
