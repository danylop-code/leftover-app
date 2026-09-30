import type { StoreBag, StoreDetail } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatWindow } from '../../../../shared/lib/format';
import { Badge, BagRow, stockTone } from '../../../../shared/ui';

type Props = { bag: StoreBag; store: StoreDetail['store']; onReserve: () => void };

/** One of today's bags; sold-out ones read "Sold out · Back tomorrow" and can't be tapped. */
export function StoreBagRow({ bag, store, onReserve }: Props) {
  const { t } = useTranslation();
  const soldOut = bag.qtyAvailable <= 0;
  const window = formatWindow(bag.pickupStart, bag.pickupEnd, store.timezone);
  const stock = soldOut ? t('ui.stock.soldOut') : t('ui.stock.left', { count: bag.qtyAvailable });
  const tone = stockTone(bag.qtyAvailable);
  return (
    <BagRow
      title={bag.title}
      category={bag.category}
      meta={soldOut ? t('storeDetail.backTomorrow') : window}
      priceMinor={bag.priceMinor}
      originalPriceMinor={bag.originalPriceMinor}
      badge={<Badge tone={tone} label={stock} onSunken={tone === 'stock'} />}
      soldOut={soldOut}
      onPress={onReserve}
      accessibilityLabel={
        soldOut
          ? t('storeDetail.soldOutLabel', { title: bag.title })
          : t('storeDetail.bagLabel', {
              title: bag.title,
              window,
              stock,
              price: formatMoney(bag.priceMinor),
            })
      }
    />
  );
}
