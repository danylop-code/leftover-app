import { StyleSheet } from 'react-native';
import { color, elevation, space } from '../../../../shared/theme';

const logoCard = 148;
export const LOGO_SIZE = 96;

// Positions, sizes and tilts copied from the Welcome artboard.
export const styles = StyleSheet.create({
  hero: {
    height: 440,
    marginHorizontal: space[3],
    marginTop: space[3],
    borderRadius: 36,
    backgroundColor: color.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: color.primaryDeep,
    left: -80,
    top: -60,
  },
  blobBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: color.primaryDeep,
    right: -70,
    bottom: -50,
  },
  tile: { position: 'absolute', ...elevation[2] },
  // Wrapper: position, tilt and shadow. Shape: size and corner radius of the tinted tile.
  bakery: { left: 32, top: 96, borderRadius: 26, transform: [{ rotate: '-9deg' }] },
  bakeryShape: { width: 92, height: 92, borderRadius: 26 },
  meals: { right: 30, top: 70, borderRadius: 24, transform: [{ rotate: '8deg' }] },
  mealsShape: { width: 84, height: 84, borderRadius: 24 },
  produce: { right: 48, bottom: 58, borderRadius: 28, transform: [{ rotate: '-6deg' }] },
  produceShape: { width: 96, height: 96, borderRadius: 28 },
  cafe: { left: 54, bottom: 46, borderRadius: 22, transform: [{ rotate: '7deg' }] },
  cafeShape: { width: 80, height: 80, borderRadius: 22 },
  logoCard: {
    width: logoCard,
    height: logoCard,
    borderRadius: 46,
    backgroundColor: color.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation[3],
  },
});
