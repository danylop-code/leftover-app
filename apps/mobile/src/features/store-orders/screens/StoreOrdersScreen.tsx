import type { StoreOrder } from '@leftover/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ApiError, NetworkError } from '../../../shared/api/client';
import { CODE_LENGTH } from '../../../shared/constants/orders';
import { formatDate } from '../../../shared/lib/format';
import { Button, HeaderLarge, Icon, Screen, Skeleton, useTabBarInset } from '../../../shared/ui';
import { useConfirmCode, useTodaysOrders } from '../api/use-store-orders';
import { CodeInput } from '../components/CodeInput/CodeInput';
import { ConfirmedPanel } from '../components/ConfirmedPanel/ConfirmedPanel';
import { StoreOrderRow } from '../components/StoreOrderRow/StoreOrderRow';
import { useStyles } from './styles';

/**
 * StoreOrders / StoreCodeSuccess / StoreCodeError artboards: enter a customer's 4-digit code,
 * see what to hand over and charge, and today's list of orders to collect.
 */
export function StoreOrdersScreen() {
  const { errorIconColor, styles } = useStyles();
  const { t } = useTranslation();
  const today = useTodaysOrders();
  const confirm = useConfirmCode();
  const [code, setCode] = useState('');
  const [confirmed, setConfirmed] = useState<StoreOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tabBarInset = useTabBarInset();

  const timezone = today.data?.timezone;
  const complete = code.length === CODE_LENGTH;

  const submit = () => {
    if (!complete || confirm.isPending) return;
    setError(null);
    confirm.mutate(
      { code },
      {
        onSuccess: (order) => setConfirmed(order),
        onError: (e) =>
          setError(
            e instanceof ApiError && e.code === 'code_not_found'
              ? t('storeOrders.notFound', { code })
              : e instanceof NetworkError
                ? t('errors.network')
                : t('errors.generic'),
          ),
      },
    );
  };

  const next = () => {
    setConfirmed(null);
    setCode('');
  };

  return (
    <Screen
      scroll
      bottomInset={tabBarInset}
      header={
        <HeaderLarge
          kicker={timezone ? formatDate(new Date(), timezone) : undefined}
          title={t('storeOrders.title')}
        />
      }
    >
      <View style={styles.content}>
        {confirmed ? (
          <ConfirmedPanel order={confirmed} onNext={next} />
        ) : (
          <View style={styles.card}>
            <View>
              <Text style={styles.heading} accessibilityRole="header">
                {t('storeOrders.enterCode')}
              </Text>
              <Text style={styles.help}>{t('storeOrders.enterCodeHelp')}</Text>
            </View>
            <CodeInput
              value={code}
              onChange={(v) => {
                setCode(v);
                setError(null);
              }}
              invalid={Boolean(error)}
            />
            {error ? (
              <View
                style={styles.errorRow}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <Icon name="alert" size="sm" color={errorIconColor} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}
            <Button
              block
              label={t('storeOrders.confirm')}
              disabled={!complete}
              loading={confirm.isPending}
              onPress={submit}
            />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.heading} accessibilityRole="header">
            {t('storeOrders.toCollect')}
          </Text>
          {today.data ? (
            <Text style={styles.count}>
              {t('storeOrders.counts', {
                toCollect: today.data.counts.toCollect,
                total: today.data.counts.total,
              })}
            </Text>
          ) : null}
        </View>

        {today.isPending ? (
          <Skeleton style={styles.skeleton} />
        ) : today.isError ? (
          <View style={styles.inlineError}>
            <Text style={styles.help}>{t('storeOrders.error.title')}</Text>
            <Button
              size="sm"
              variant="secondary"
              icon="refresh"
              label={t('storeOrders.error.retry')}
              onPress={() => today.refetch()}
            />
          </View>
        ) : today.data.orders.length === 0 ? (
          <Text style={styles.help}>{t('storeOrders.empty')}</Text>
        ) : (
          <View style={styles.list}>
            {today.data.orders.map((order, i, all) => (
              <StoreOrderRow
                key={order.id}
                order={order}
                timezone={today.data.timezone}
                last={i === all.length - 1}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
