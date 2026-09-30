import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { MIN_FIT_SCALE, SINGLE_LINE } from '../../constants/ui';
import { formatMoney } from '../../lib/format';
import { useStyles } from './styles';

type Props = {
  priceMinor: number;
  originalMinor?: number;
  size?: 'md' | 'lg';
  soldOut?: boolean;
  /** Where wrapped lines sit: `end` when the price closes a row (bag rows, the Reserve total). */
  align?: 'start' | 'end';
};

/**
 * Old price struck through beside the sale price; read as one label ("₴149, was ₴450").
 * Where the row is too narrow (OMR prices, Arabic), the old price wraps onto its own line
 * instead of pushing it out of the card; the sale price stays on one line.
 */
export function Price({ priceMinor, originalMinor, size = 'md', soldOut, align = 'start' }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const price = formatMoney(priceMinor);
  const original = originalMinor !== undefined ? formatMoney(originalMinor) : undefined;
  return (
    <View
      style={[styles.root, align === 'end' && styles.end]}
      accessible
      accessibilityLabel={original ? t('ui.price.was', { price, original }) : price}
    >
      {original ? (
        <Text style={styles.old} numberOfLines={SINGLE_LINE}>
          {original}
        </Text>
      ) : null}
      <Text
        style={[styles.sale, size === 'lg' && styles.saleLg, soldOut && styles.soldOut]}
        numberOfLines={SINGLE_LINE}
        adjustsFontSizeToFit
        minimumFontScale={MIN_FIT_SCALE}
      >
        {price}
      </Text>
    </View>
  );
}
