import { Text as RNText, type TextProps } from 'react-native';
import { color as palette } from '../../theme';
import { styles } from './styles';

type Props = TextProps & {
  variant?: keyof typeof styles;
  color?: keyof typeof palette;
};

/** Themed text: a typography variant plus a color token. */
export function Text({ variant = 'body', color = 'textPrimary', style, ...rest }: Props) {
  return <RNText style={[styles[variant], { color: palette[color] }, style]} {...rest} />;
}
