import { Text as RNText, type TextProps } from 'react-native';
import { type Theme, type typography, useTheme } from '../../theme';
import { useStyles } from './styles';

type Props = TextProps & {
  variant?: keyof typeof typography;
  color?: keyof Theme['color'];
};

/** Themed text: a typography variant plus a color token. */
export function Text({ variant = 'body', color = 'textPrimary', style, ...rest }: Props) {
  const { styles } = useStyles();
  const theme = useTheme();
  return <RNText style={[styles[variant], { color: theme.color[color] }, style]} {...rest} />;
}
