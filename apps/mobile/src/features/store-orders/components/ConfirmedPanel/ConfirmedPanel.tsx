import type { StoreOrder } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { formatMoney } from '../../../../shared/lib/format';
import { Button, Icon } from '../../../../shared/ui';
import { checkColor, checkStroke, styles } from './styles';

type Props = { order: StoreOrder; onNext: () => void };

/** StoreCodeSuccess: what to hand over, to whom, and what to charge. */
export function ConfirmedPanel({ order, onNext }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card} accessibilityRole="summary" accessibilityLiveRegion="polite">
      <View style={styles.check}>
        <Icon name="check" size="xl" color={checkColor} strokeWidth={checkStroke} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {t('storeOrders.success.title', { code: order.code })}
      </Text>
      <Text style={styles.text}>
        {t('storeOrders.success.handOver')}{' '}
        <Text style={styles.strong}>
          {t('storeOrders.success.items', { qty: order.qty, title: order.bagTitle })}
        </Text>{' '}
        {t('storeOrders.success.to', { name: order.customerName })}
      </Text>
      <View style={styles.payment}>
        <Text style={styles.paymentLabel}>{t('storeOrders.success.payment')}</Text>
        <Text style={styles.paymentAmount}>{formatMoney(order.totalMinor)}</Text>
      </View>
      <View style={styles.next}>
        <Button block label={t('storeOrders.success.next')} onPress={onNext} />
      </View>
    </View>
  );
}
