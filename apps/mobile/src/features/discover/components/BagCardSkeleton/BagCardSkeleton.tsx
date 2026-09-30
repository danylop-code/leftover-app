import { View } from 'react-native';
import { Skeleton } from '../../../../shared/ui';
import { styles } from './styles';

type Props = { compact?: boolean };

/** DiscoverLoading's placeholder card; `compact` is the shorter second card. */
export function BagCardSkeleton({ compact }: Props) {
  return (
    <View
      style={styles.card}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Skeleton style={styles.media} />
      <View style={styles.body}>
        <Skeleton style={styles.logo} />
        <Skeleton style={compact ? styles.storeCompact : styles.store} />
        <Skeleton style={compact ? styles.titleCompact : styles.title} />
        <Skeleton style={compact ? styles.metaCompact : styles.meta} />
        {compact ? null : (
          <View style={styles.foot}>
            <Skeleton style={styles.facts} />
            <Skeleton style={styles.price} />
          </View>
        )}
      </View>
    </View>
  );
}
