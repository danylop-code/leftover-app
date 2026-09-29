import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { useFieldContext } from './field-context';
import { useStyles } from './styles';

type Props = Omit<TextInputProps, 'style' | 'multiline'>;

/** Multi-line input; pair with <Field count maxCount> for the counter. */
export function Textarea({ onFocus, onBlur, ...rest }: Props) {
  const { inputStyles, placeholderColor } = useStyles();
  const { label, invalid } = useFieldContext();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      multiline
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
      style={[inputStyles.textarea, focused && inputStyles.focus, invalid && inputStyles.error]}
      {...rest}
    />
  );
}
