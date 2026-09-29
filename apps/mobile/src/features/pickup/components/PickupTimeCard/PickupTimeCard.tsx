import type { OrderDetail } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { formatDuration } from '../../../../shared/lib/duration';
import { formatDay, formatTime, formatTimeRange } from '../../../../shared/lib/format';
import { Icon, ProgressBar } from '../../../../shared/ui';
import { clockColors, styles } from './styles';

type Props = { order: OrderDetail; now: Date; reservedAt: string };

/**
 * When to come: "Pickup opens in 1 h 24 min" before the window (the bar fills from the moment
 * of reserving), "Ready now · until 19:30" inside it, "Pickup window ended" after.
 */
export function PickupTimeCard({ order, now, reservedAt }: Props) {
  const { t } = useTranslation();
  const { bag, store, displayStatus } = order;
  const start = new Date(bag.pickupStart).getTime();
  const created = new Date(reservedAt).getTime();
  const tone = displayStatus === 'ready' ? 'ready' : displayStatus === 'missed' ? 'missed' : 'soon';
  const lead =
    displayStatus === 'reserved'
      ? t('pickup.opensIn')
      : displayStatus === 'ready'
        ? t('pickup.readyUntil', { time: formatTime(bag.pickupEnd, store.timezone) })
        : t('pickup.endedText');
  const headline =
    displayStatus === 'reserved'
      ? formatDuration(start - now.getTime())
      : displayStatus === 'ready'
        ? t('pickup.readyNow')
        : t('pickup.ended');
  const progress =
    displayStatus === 'reserved' && start > created
      ? (now.getTime() - created) / (start - created)
      : 1;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.clock, { backgroundColor: clockColors[tone].bg }]}>
          <Icon name="clock" size="lg" color={clockColors[tone].fg} />
        </View>
        <View style={styles.body}>
          <Text style={styles.caption}>{lead}</Text>
          <Text style={styles.headline} accessibilityLiveRegion="polite">
            {headline}
          </Text>
        </View>
        <View style={styles.when}>
          <Text style={styles.caption}>{formatDay(bag.pickupStart, store.timezone, now)}</Text>
          <Text style={styles.range}>
            {formatTimeRange(bag.pickupStart, bag.pickupEnd, store.timezone)}
          </Text>
        </View>
      </View>
      {displayStatus === 'reserved' ? (
        <ProgressBar value={progress} label={t('pickup.progress')} />
      ) : null}
    </View>
  );
}
