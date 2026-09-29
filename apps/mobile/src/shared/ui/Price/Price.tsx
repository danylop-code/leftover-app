import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { formatMoney } from '../../lib/format';
import { styles } from './styles';

type Props = {
  priceMinor: number;
  originalMinor?: number;
  size?: 'md' | 'lg';
  soldOut?: boolean;
};

/** Old price struck through beside the sale price; read as one label ("₴149, was ₴450"). */
export function Price({ priceMinor, originalMinor, size = 'md', soldOut }: Props) {
  const { t } = useTranslation();
  const price = formatMoney(priceMinor);
  const original = originalMinor !== undefined ? formatMoney(originalMinor) : undefined;
  return (
    <View
      style={styles.root}
      accessible
      accessibilityLabel={original ? t('ui.price.was', { price, original }) : price}
    >
      {original ? <Text style={styles.old}>{original}</Text> : null}
      <Text style={[styles.sale, size === 'lg' && styles.saleLg, soldOut && styles.soldOut]}>
        {price}
      </Text>
    </View>
  );
}
