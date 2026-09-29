import type { OrderDetail } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { NO_STARS } from '../../../../shared/constants/ui';
import { formatDay, formatMoney, formatTime } from '../../../../shared/lib/format';
import { Badge, Button, Stars, StoreLogo, SuccessArt } from '../../../../shared/ui';
import { useStyles } from './styles';

type Props = {
  order: OrderDetail;
  /** Opens Review, with the tapped star count preselected. */
  onRate: (overall?: number) => void;
  onDone: () => void;
};

/** PickupCollected artboard: what was collected, what it saved, and a quick rating. */
export function CollectedView({ order, onRate, onDone }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { store, bag } = order;
  const savedMinor = (order.unitOriginalPriceMinor - order.unitPriceMinor) * order.qty;
  const collectedAt = order.collectedAt ?? order.createdAt;
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.art}>
          <SuccessArt />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {t('pickup.collected.title')}
        </Text>
        <Text style={styles.text}>
          {t('pickup.collected.text', {
            count: order.qty,
            store: store.name,
            time: formatTime(collectedAt, store.timezone),
          })}
        </Text>
        <View style={styles.saved}>
          <Text style={styles.savedText}>
            {t('pickup.collected.saved', { amount: formatMoney(savedMinor) })}
          </Text>
        </View>
      </View>

      <View style={styles.summary}>
        <StoreLogo id={store.id} name={store.name} logo={store.logoUrl} />
        <View style={styles.summaryBody}>
          <Text style={styles.summaryTitle}>{bag.title}</Text>
          <Text style={styles.summaryCaption}>
            {t('pickup.collected.code', {
              code: order.code,
              day: formatDay(collectedAt, store.timezone),
            })}
          </Text>
        </View>
        <Badge tone="collected" label={t('ui.status.collected')} onSunken />
      </View>

      <View style={styles.rateCard}>
        {order.rating ? (
          <>
            <Text style={styles.rateTitle}>{t('pickup.collected.rated')}</Text>
            <Stars value={order.rating} />
          </>
        ) : (
          <>
            <Text style={styles.rateTitle} accessibilityRole="header">
              {t('pickup.collected.rateTitle')}
            </Text>
            <Stars mode="input" size="lg" value={NO_STARS} onChange={(n) => onRate(n)} />
            <Text style={styles.caption}>{t('pickup.collected.rateHint')}</Text>
            <View style={styles.rateAction}>
              <Button block label={t('pickup.collected.leaveReview')} onPress={() => onRate()} />
            </View>
          </>
        )}
      </View>

      <Button block variant="ghost" label={t('pickup.collected.backToDiscover')} onPress={onDone} />
    </View>
  );
}
