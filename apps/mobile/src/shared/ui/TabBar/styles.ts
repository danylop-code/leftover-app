import { StyleSheet } from 'react-native';
import { color, elevation, fontFamily, space, tabBar, tapMin } from '../../theme';

// `.tabbar`: a compact centred island; screens scroll underneath (pad them with useTabBarInset).
export const styles = StyleSheet.create({
  // Spans the width only to centre the island; taps outside the island pass through.
  dock: { position: 'absolute', left: tabBar.inset, right: tabBar.inset, alignItems: 'center' },
  island: {
    height: tabBar.height,
    padding: tabBar.padding,
    flexDirection: 'row',
    gap: space[1],
    backgroundColor: color.surface,
    borderRadius: tabBar.radius,
    ...elevation[3],
  },
  tab: {
    width: tabBar.tab,
    minHeight: tapMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tabBar.radius - tabBar.padding,
  },
  tabActive: { backgroundColor: color.primarySoft },
  pressed: { backgroundColor: color.surfaceSunken },
  label: {
    fontFamily: fontFamily.body['700'],
    fontSize: 12,
    lineHeight: 16,
    color: color.textSecondary,
  },
  labelActive: { color: color.primary },
});

export const tint = { active: color.primary, inactive: color.textSecondary } as const;
