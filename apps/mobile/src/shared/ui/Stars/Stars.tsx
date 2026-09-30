import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { RATING_DECIMALS, RATING_MAX } from '../../constants/ui';
import { Star } from './Star';
import { buttonHitSlop, starSize, styles } from './styles';

const positions = Array.from({ length: RATING_MAX }, (_, i) => i + 1);

type Props =
  | { mode?: 'display'; value: number; size?: keyof typeof starSize }
  | {
      mode: 'input';
      value: number;
      onChange: (value: number) => void;
      size?: keyof typeof starSize;
    };

/** Display: one image read as "4.7 out of 5". Input: five labelled buttons reporting 1–5. */
export function Stars(props: Props) {
  const { t } = useTranslation();
  const { value } = props;

  if (props.mode !== 'input') {
    const size = props.size ?? 'sm';
    return (
      <View
        style={styles.row}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('ui.stars.outOf', {
          value: value.toFixed(RATING_DECIMALS).replace(/\.0$/, ''),
        })}
      >
        {positions.map((n) => (
          <Star key={n} size={starSize[size]} on={n <= Math.round(value)} />
        ))}
      </View>
    );
  }

  const size = props.size ?? 'md';
  const { onChange } = props;
  return (
    <View style={styles.inputRow}>
      {positions.map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          accessibilityLabel={t('ui.stars.star', { count: n })}
          accessibilityState={{ selected: n <= value }}
          hitSlop={buttonHitSlop[size]}
          onPress={() => onChange(n)}
          style={[styles.button, styles[size]]}
        >
          <Star size={starSize[size]} on={n <= value} />
        </Pressable>
      ))}
    </View>
  );
}
