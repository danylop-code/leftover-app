import {
  REPORT_MESSAGE_MAX,
  REPORT_MESSAGE_MIN,
  ReportBody,
  ReportSubject,
} from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { formatDay } from '../../../shared/lib/format';
import { useSession } from '../../../shared/store/session';
import {
  Banner,
  Button,
  ChoiceList,
  EmptyState,
  Field,
  Header,
  Screen,
  SuccessArt,
  Textarea,
} from '../../../shared/ui';
import { useCreateReport } from '../api/use-create-report';
import { useRecentOrders } from '../api/use-recent-orders';
import { useStyles } from './styles';

const NO_ORDER = 'none';

/**
 * Report / ReportSent artboards: subject, optionally which order (customers), and a message;
 * then the reference to quote. Stored only (there's no support inbox yet).
 */
export function ReportScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const isCustomer = user?.role === 'customer';
  const recent = useRecentOrders(isCustomer);
  const report = useCreateReport();
  const [subject, setSubject] = useState<ReportSubject | null>(null);
  const [orderId, setOrderId] = useState<string>(NO_ORDER);
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const close = () =>
    router.canGoBack() ? router.back() : router.replace(isCustomer ? '/profile' : '/store-profile');
  const length = message.trim().length;
  const messageOk = length >= REPORT_MESSAGE_MIN && length <= REPORT_MESSAGE_MAX;
  const canSend = subject !== null && messageOk;

  const reset = () => {
    setSubject(null);
    setOrderId(NO_ORDER);
    setMessage('');
    setReference(null);
    setFailed(false);
  };

  const send = () => {
    const body = ReportBody.safeParse({
      subject,
      orderId: orderId === NO_ORDER ? undefined : orderId,
      message,
    });
    if (!body.success) return;
    setFailed(false);
    report.mutate(body.data, {
      onSuccess: (created) => setReference(created.reference),
      onError: () => setFailed(true),
    });
  };

  if (reference) {
    return (
      <Screen header={<Header onBack={close} backIcon="close" />}>
        <View style={styles.centered}>
          <EmptyState
            live
            tone="success"
            art={<SuccessArt />}
            title={t('report.sent.title')}
            text={t('report.sent.text', { email: user?.email ?? '', reference })}
            actions={
              <>
                <Button block label={t('report.sent.back')} onPress={close} />
                <Button block variant="ghost" label={t('report.sent.again')} onPress={reset} />
              </>
            }
          />
        </View>
      </Screen>
    );
  }

  const orderOptions = [
    ...recent.map((o) => ({
      value: o.id,
      label: t('report.orderOption', {
        store: o.store.name,
        title: o.bag.title,
        day: formatDay(o.bag.pickupStart, o.store.timezone),
      }),
    })),
    { value: NO_ORDER, label: t('report.noOrder') },
  ];

  return (
    <Screen scroll header={<Header title={t('report.title')} onBack={close} />}>
      <View style={styles.content}>
        <Text style={styles.intro}>{t('report.intro')}</Text>
        {failed ? <Banner tone="danger" title={t('report.failed')} /> : null}
        <View style={styles.group}>
          <Text style={styles.label}>{t('report.subject')}</Text>
          <ChoiceList
            label={t('report.subject')}
            value={subject}
            onChange={setSubject}
            options={ReportSubject.options.map((s) => ({
              value: s,
              label: t(`report.subjects.${s}`),
            }))}
          />
        </View>
        {isCustomer && recent.length > 0 ? (
          <View style={styles.group}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('report.order')}</Text>
              <Text style={styles.optional}>{t('ui.field.optional')}</Text>
            </View>
            <ChoiceList
              label={t('report.order')}
              value={orderId}
              onChange={setOrderId}
              options={orderOptions}
            />
          </View>
        ) : null}
        <Field
          label={t('report.message')}
          help={t('report.messageHelp')}
          error={length > REPORT_MESSAGE_MAX ? t('report.messageError') : null}
          count={message.length}
          maxCount={REPORT_MESSAGE_MAX}
        >
          <Textarea value={message} onChangeText={setMessage} />
        </Field>
        <Button
          block
          label={t('report.send')}
          disabled={!canSend}
          loading={report.isPending}
          onPress={send}
        />
      </View>
    </Screen>
  );
}
