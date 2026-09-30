import { StyleSheet } from 'react-native';
import { color, elevation } from '../../theme';

// Web only: a column about as wide as a large phone.
const PHONE_WIDTH = 430;

export const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', backgroundColor: color.surfaceSunken },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: PHONE_WIDTH,
    overflow: 'hidden',
    backgroundColor: color.background,
    ...elevation[2],
  },
});
