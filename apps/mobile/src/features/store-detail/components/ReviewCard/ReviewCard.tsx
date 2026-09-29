import type { ReviewSummary } from '@leftover/shared';
import { Text, View } from 'react-native';
import { formatRelative } from '../../../../shared/lib/relative-time';
import { Stars } from '../../../../shared/ui';
import { styles } from './styles';

/** One recent review: initial, name, when, stars and text. */
export function ReviewCard({ review }: { review: ReviewSummary }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View
          style={styles.avatar}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.initial}>{review.authorName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.who}>
          <Text style={styles.name}>{review.authorName}</Text>
          <Text style={styles.when}>{formatRelative(review.createdAt)}</Text>
        </View>
        <Stars value={review.overall} />
      </View>
      {review.text ? <Text style={styles.text}>{review.text}</Text> : null}
    </View>
  );
}
