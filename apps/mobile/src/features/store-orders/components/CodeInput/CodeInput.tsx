import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from 'react-native';
import { CODE_LENGTH } from '../../../../shared/constants/orders';
import { useStyles } from './styles';

type Props = {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => i);
const digitsOnly = (text: string) => text.replace(/\D/g, '');

/**
 * Four one-digit boxes (`.code-box`): typing moves to the next box, Backspace on an empty box
 * goes back, and pasting a whole code fills them all.
 */
export function CodeInput({ value, onChange, invalid }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const refs = useRef<(TextInput | null)[]>([]);

  const setAt = (index: number, text: string) => {
    const digits = digitsOnly(text);
    if (digits.length > 1) {
      // A paste (or autofill) of several digits: fill from this box on.
      const next = (value.slice(0, index) + digits).slice(0, CODE_LENGTH);
      onChange(next);
      refs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    const next = value.slice(0, index) + digits + value.slice(index + 1);
    onChange(next);
    if (digits && index < CODE_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const onKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      onChange(value.slice(0, index - 1));
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row} accessibilityLabel={t('storeOrders.codeLegend')}>
      {boxes.map((i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          accessibilityLabel={t('storeOrders.digit', { n: i + 1 })}
          value={value[i] ?? ''}
          onChangeText={(text) => setAt(i, text)}
          onKeyPress={(e) => onKeyPress(i, e)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          selectTextOnFocus
          style={[styles.box, value[i] ? styles.filled : null, invalid && styles.invalid]}
        />
      ))}
    </View>
  );
}
