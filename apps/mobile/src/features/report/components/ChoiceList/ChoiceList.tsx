import { Pressable, Text, View } from 'react-native';
import { Icon } from '../../../../shared/ui';
import { checkColor, styles } from './styles';

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

/** A labelled radio group as a card of rows (the artboard's selects, native-friendly). */
export function ChoiceList<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((option, i) => {
        const checked = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.row,
              i === options.length - 1 && styles.last,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.dot, checked && styles.dotOn]}>
              {checked ? <Icon name="check" size="sm" color={checkColor} /> : null}
            </View>
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
