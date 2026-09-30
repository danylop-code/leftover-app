import { View } from 'react-native';
import { CategoryMedia } from '../../../../shared/ui';
import { LogoMark } from '../LogoMark/LogoMark';
import { LOGO_SIZE, useStyles } from './styles';

/** Decorative hero: brand mark over tilted category tiles. Hidden from screen readers. */
export function WelcomeHero() {
  const { styles } = useStyles();
  return (
    <View
      style={styles.hero}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <View style={[styles.tile, styles.bakery]}>
        <CategoryMedia category="bakery" variant="thumb" style={styles.bakeryShape} />
      </View>
      <View style={[styles.tile, styles.meals]}>
        <CategoryMedia category="meals" variant="thumb" style={styles.mealsShape} />
      </View>
      <View style={[styles.tile, styles.produce]}>
        <CategoryMedia category="produce" variant="thumb" style={styles.produceShape} />
      </View>
      <View style={[styles.tile, styles.cafe]}>
        <CategoryMedia category="cafe" variant="thumb" style={styles.cafeShape} />
      </View>
      <View style={styles.logoCard}>
        <LogoMark size={LOGO_SIZE} />
      </View>
    </View>
  );
}
