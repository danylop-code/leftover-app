import { type ReactNode, useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { Icon, type IconName } from '../icons';
import { useFieldContext } from './field-context';
import { iconColor, inputStyles, placeholderColor } from './styles';

type Props = Omit<TextInputProps, 'style'> & {
  icon?: IconName;
  prefix?: string;
  right?: ReactNode;
  /** Fully rounded (search fields). */
  pill?: boolean;
};

/** Single-line input; takes its accessible label and error state from the enclosing <Field>. */
export function Input({ icon, prefix, right, pill, onFocus, onBlur, ...rest }: Props) {
  const { label, invalid } = useFieldContext();
  const [focused, setFocused] = useState(false);
  return (
    <View
      testID="input-wrap"
      style={[
        inputStyles.wrap,
        pill && inputStyles.pill,
        focused && inputStyles.focus,
        invalid && inputStyles.error,
      ]}
    >
      {icon ? <Icon name={icon} color={iconColor} /> : null}
      {prefix ? <Text style={inputStyles.prefix}>{prefix}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={placeholderColor}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={inputStyles.input}
        {...rest}
      />
      {right}
    </View>
  );
}
