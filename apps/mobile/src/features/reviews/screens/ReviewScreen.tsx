import { REVIEW_ASPECTS, REVIEW_TEXT_MAX, type ReviewAspect } from '@leftover/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ApiError } from '../../../shared/api/client';
import { useOrder } from '../../../shared/api/use-order';
import { formatDay } from '../../../shared/lib/format';
import {
  Banner,
  BottomBar,
  Button,
  Field,
  Header,
  Screen,
  Skeleton,
  Stars,
  StoreLogo,
  Textarea,
} from '../../../shared/ui';
import { useSubmitReview } from '../api/use-submit-review';
import { styles } from './styles';

type Aspects = Partial<Record<ReviewAspect, number>>;

const STAR_VALUES = ['1', '2', '3', '4', '5'] as const;
const isStarValue = (v: string | undefined): v is (typeof STAR_VALUES)[number] =>
  STAR_VALUES.includes(v as (typeof STAR_VALUES)[number]);

/**
 * Review artboard: overall stars (required, with a word), optional aspects and text. Opened
 * from Collected (with the tapped stars preselected) or from a past order.
 */
export function ReviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId: string; overall?: string }>();
  const orderId = String(params.orderId);
  const order = useOrder(orderId);
  const submit = useSubmitReview(orderId);
  const [overall, setOverall] = useState(isStarValue(params.overall) ? Number(params.overall) : 0);
  const [aspects, setAspects] = useState<Aspects>({});
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/orders'));
  const tooLong = text.length > REVIEW_TEXT_MAX;
  const canSubmit = overall > 0 && !tooLong;

  const send = () => {
    if (!canSubmit) return;
    setError(null);
    submit.mutate(
      { overall, ...aspects, text },
      {
        onSuccess: close,
        onError: (e) =>
          setError(
            e instanceof ApiError && e.code === 'already_reviewed'
              ? t('review.already')
              : t('review.failed'),
          ),
      },
    );
  };

  return (
    <Screen
      scroll
      header={<Header title={t('review.title')} onBack={close} backIcon="close" />}
      footer={
        <BottomBar>
          <Button
            block
            label={t('review.submit')}
            disabled={!canSubmit}
            loading={submit.isPending}
            onPress={send}
            accessibilityHint={overall === 0 ? t('review.pickOverall') : undefined}
          />
        </BottomBar>
      }
    >
      <View style={styles.content}>
        {order.data ? (
          <View style={styles.bag}>
            <StoreLogo id={order.data.store.id} name={order.data.store.name} />
            <View>
              <Text style={styles.store}>{order.data.store.name}</Text>
              <Text style={styles.caption}>
                {t('review.subtitle', {
                  title: order.data.bag.title,
                  day: formatDay(
                    order.data.collectedAt ?? order.data.bag.pickupStart,
                    order.data.store.timezone,
                  ),
                })}
              </Text>
            </View>
          </View>
        ) : (
          <Skeleton style={styles.skeleton} />
        )}

        {error ? <Banner tone="danger" title={error} /> : null}

        <View style={styles.overallCard}>
          <Text style={styles.heading} accessibilityRole="header">
            {t('review.overall')}
          </Text>
          <Stars mode="input" size="lg" value={overall} onChange={setOverall} />
          <Text style={styles.word} accessibilityLiveRegion="polite">
            {overall > 0 ? t(`review.words.${overall as 1 | 2 | 3 | 4 | 5}`) : ' '}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailsHead}>
            <Text style={styles.detailsTitle}>{t('review.details')}</Text>
            <Text style={styles.caption}>{t('ui.field.optional')}</Text>
          </View>
          {REVIEW_ASPECTS.map((aspect) => (
            <View key={aspect} style={styles.aspect}>
              <Text style={styles.aspectName}>{t(`review.aspects.${aspect}`)}</Text>
              <Stars
                mode="input"
                size="sm"
                value={aspects[aspect] ?? 0}
                onChange={(v) => setAspects((a) => ({ ...a, [aspect]: v }))}
              />
            </View>
          ))}
        </View>

        <Field label={t('review.text')} optional count={text.length} maxCount={REVIEW_TEXT_MAX}>
          <Textarea value={text} onChangeText={setText} placeholder={t('review.textPlaceholder')} />
        </Field>
      </View>
    </Screen>
  );
}
