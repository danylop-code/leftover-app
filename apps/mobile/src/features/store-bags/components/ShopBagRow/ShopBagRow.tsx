import type { ShopBag } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { SINGLE_LINE } from '../../../../shared/constants/ui';
import { Badge, CategoryMedia, Price, Switch, stockTone } from '../../../../shared/ui';
import { useStyles } from './styles';

type Props = { bag: ShopBag; onEdit: () => void; onToggle: (isActive: boolean) => void };

/** A bag on My bags: tap to edit, switch to pause or resume. */
export function ShopBagRow({ bag, onEdit, onToggle }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const soldOut = bag.qtyAvailable <= 0;
  const badge = !bag.isActive ? (
    <Badge tone="out" label={t('storeBags.paused', { count: bag.qtyAvailable })} />
  ) : soldOut ? (
    <Badge tone="out" label={t('ui.stock.soldOut')} />
  ) : (
    <Badge
      tone={stockTone(bag.qtyAvailable)}
      label={t('storeBags.leftOf', { available: bag.qtyAvailable, total: bag.qtyTotal })}
      onSunken={stockTone(bag.qtyAvailable) === 'stock'}
    />
  );
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={bag.title}
        onPress={onEdit}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={!bag.isActive && styles.paused}>
          <CategoryMedia category={bag.category} variant="small" />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={SINGLE_LINE}>
            {bag.title}
          </Text>
          <View style={styles.facts}>
            <Price
              priceMinor={bag.priceMinor}
              originalMinor={bag.originalPriceMinor}
              soldOut={!bag.isActive}
            />
            {badge}
          </View>
        </View>
      </Pressable>
      <Switch
        value={bag.isActive}
        onValueChange={onToggle}
        label={
          bag.isActive
            ? t('storeBags.live', { title: bag.title })
            : t('storeBags.pausedLabel', { title: bag.title })
        }
      />
    </View>
  );
}
