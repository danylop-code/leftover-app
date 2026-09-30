import {
  BAG_DESCRIPTION_MAX,
  BAG_QTY_MAX,
  BagBody,
  type Category,
  Category as CategorySchema,
  type ShopBag,
  TimeOfDay,
} from '@leftover/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { CURRENCY_SYMBOL } from '../../../../shared/constants/money';
import { formatDiscount } from '../../../../shared/lib/format';
import { moneyInputText, parseMoneyInput } from '../../../../shared/lib/money-input';
import { isoAtLocalTime, localTimeOf } from '../../../../shared/lib/zoned-time';
import {
  Badge,
  Banner,
  Button,
  Chip,
  Field,
  Input,
  Price,
  Stepper,
  Switch,
  Textarea,
  TimeField,
} from '../../../../shared/ui';
import { styles } from './styles';

type FieldName =
  | 'title'
  | 'description'
  | 'category'
  | 'originalPrice'
  | 'salePrice'
  | 'from'
  | 'until'
  | 'qty';
export type BagFormErrors = Partial<Record<FieldName, string>>;

type Props = {
  /** The bag being edited; absent when adding. */
  initial?: ShopBag;
  timezone: string;
  saving: boolean;
  deleting?: boolean;
  /** Errors from the API (e.g. `below_reserved`), shown on their fields. */
  serverErrors?: BagFormErrors;
  banner?: string | null;
  onSave: (body: BagBody) => void;
  onDelete?: () => void;
};

const categories = CategorySchema.options;

/** AddBag artboard: every field of a bag, validated with the shared `BagBody` rules. */
export function BagForm({
  initial,
  timezone,
  saving,
  deleting,
  serverErrors,
  banner,
  onSave,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<Category | null>(initial?.category ?? null);
  const [original, setOriginal] = useState(
    initial ? moneyInputText(initial.originalPriceMinor) : '',
  );
  const [sale, setSale] = useState(initial ? moneyInputText(initial.priceMinor) : '');
  const reserved = initial?.reservedCount ?? 0;
  const minQty = Math.max(1, reserved);
  const [qty, setQty] = useState(Math.max(initial?.qtyTotal ?? 1, minQty));
  const [from, setFrom] = useState(initial ? localTimeOf(initial.pickupStart, timezone) : '');
  const [until, setUntil] = useState(initial ? localTimeOf(initial.pickupEnd, timezone) : '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<BagFormErrors>({});
  const shown = { ...errors, ...serverErrors };

  const originalMinor = parseMoneyInput(original);
  const saleMinor = parseMoneyInput(sale);
  const discount =
    originalMinor !== null && saleMinor !== null ? formatDiscount(originalMinor, saleMinor) : null;

  const submit = () => {
    const next: BagFormErrors = {};
    if (!TimeOfDay.safeParse(from).success) next.from = t('bagForm.errors.time');
    if (!TimeOfDay.safeParse(until).success) next.until = t('bagForm.errors.time');
    if (originalMinor === null) next.originalPrice = t('bagForm.errors.price');
    if (saleMinor === null) next.salePrice = t('bagForm.errors.price');
    const today = new Date();
    const pickupStart = next.from ? '' : isoAtLocalTime(from, today, timezone);
    const pickupEnd = next.until ? '' : isoAtLocalTime(until, today, timezone);
    const parsed = BagBody.safeParse({
      title,
      description,
      category: category ?? undefined,
      originalPriceMinor: originalMinor ?? 0,
      priceMinor: saleMinor ?? 0,
      qtyTotal: qty,
      pickupStart: pickupStart || undefined,
      pickupEnd: pickupEnd || undefined,
      isActive,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path === 'title' && !next.title) next.title = t('bagForm.errors.title');
        if (path === 'description') next.description = t('bagForm.errors.description');
        if (path === 'category') next.category = t('bagForm.errors.category');
        if (path === 'priceMinor' && !next.salePrice && issue.code === 'custom')
          next.salePrice = t('bagForm.errors.saleBelow');
        if (path === 'pickupEnd' && !next.until && issue.code === 'custom')
          next.until = t('bagForm.errors.windowLength');
      }
    }
    if (!next.until && pickupEnd && new Date(pickupEnd).getTime() <= Date.now())
      next.until = t('bagForm.errors.windowPast');
    setErrors(next);
    if (Object.keys(next).length === 0 && parsed.success) onSave(parsed.data);
  };

  return (
    <View style={styles.form}>
      {banner ? <Banner tone="danger" title={banner} /> : null}
      <Field label={t('bagForm.title')} error={shown.title}>
        <Input value={title} onChangeText={setTitle} autoCapitalize="sentences" />
      </Field>
      <Field
        label={t('bagForm.description')}
        help={t('bagForm.descriptionHelp')}
        error={shown.description}
        count={description.length}
        maxCount={BAG_DESCRIPTION_MAX}
      >
        <Textarea value={description} onChangeText={setDescription} />
      </Field>
      <Field label={t('bagForm.category')} error={shown.category}>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Chip
              key={c}
              label={t(`categories.${c}`)}
              selected={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>
      </Field>
      <View style={styles.group}>
        <View style={styles.pair}>
          <View style={styles.half}>
            <Field label={t('bagForm.originalPrice')} error={shown.originalPrice}>
              <Input
                prefix={CURRENCY_SYMBOL}
                value={original}
                onChangeText={setOriginal}
                keyboardType="decimal-pad"
              />
            </Field>
          </View>
          <View style={styles.half}>
            <Field label={t('bagForm.salePrice')} error={shown.salePrice}>
              <Input
                prefix={CURRENCY_SYMBOL}
                value={sale}
                onChangeText={setSale}
                keyboardType="decimal-pad"
              />
            </Field>
          </View>
        </View>
        {discount && originalMinor !== null && saleMinor !== null ? (
          <View style={styles.preview}>
            <Badge tone="discount" label={discount} />
            <Text style={styles.previewText}>{t('bagForm.shownAs')}</Text>
            <Price priceMinor={saleMinor} originalMinor={originalMinor} />
          </View>
        ) : null}
      </View>
      <View style={styles.card}>
        <View style={styles.cardText}>
          <Text style={styles.cardLabel}>{t('bagForm.qty')}</Text>
          {reserved > 0 ? (
            <Text style={styles.caption}>{t('bagForm.reserved', { count: reserved })}</Text>
          ) : null}
          {shown.qty ? <Text style={styles.error}>{shown.qty}</Text> : null}
        </View>
        <Stepper
          value={qty}
          min={minQty}
          max={BAG_QTY_MAX}
          onChange={setQty}
          decreaseLabel={t('reserve.fewer')}
          increaseLabel={t('reserve.more')}
        />
      </View>
      <View style={styles.group}>
        <Text style={styles.groupLabel}>{t('bagForm.window')}</Text>
        <View style={styles.pair}>
          <View style={styles.half}>
            <Field label={t('bagForm.from')} error={shown.from}>
              <TimeField value={from} onChange={setFrom} />
            </Field>
          </View>
          <View style={styles.half}>
            <Field label={t('bagForm.until')} error={shown.until}>
              <TimeField value={until} onChange={setUntil} />
            </Field>
          </View>
        </View>
        <Text style={styles.caption}>{t('bagForm.windowHelp')}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardText}>
          <Text style={styles.cardLabel}>{t('bagForm.live')}</Text>
          <Text style={styles.caption}>{t('bagForm.liveHelp')}</Text>
        </View>
        <Switch value={isActive} onValueChange={setIsActive} label={t('bagForm.live')} />
      </View>
      <View style={styles.actions}>
        <Button
          block
          label={initial ? t('bagForm.save') : t('bagForm.saveNew')}
          loading={saving}
          onPress={submit}
        />
        {onDelete ? (
          <Button
            block
            variant="danger"
            label={t('bagForm.delete')}
            loading={deleting}
            onPress={onDelete}
          />
        ) : null}
      </View>
    </View>
  );
}
