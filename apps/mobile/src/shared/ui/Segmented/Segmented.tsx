import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { segmentHitSlop, styles } from './styles';

type Option<T extends string> = { value: T; label: string; count?: number };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Two-or-more segment switch (`.seg`) with an optional count pill per segment. */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const { t } = useTranslation();
  return (
    <View style={styles.root} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={
              o.count !== undefined ? t('ui.pair', { label: o.label, value: o.count }) : o.label
            }
            onPress={() => onChange(o.value)}
            hitSlop={segmentHitSlop}
            style={[styles.segment, active && styles.active]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
            {o.count !== undefined ? <Text style={styles.count}>{o.count}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
