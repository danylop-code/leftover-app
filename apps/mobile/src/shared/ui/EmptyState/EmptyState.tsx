import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useStyles } from './styles';

type Props = {
  art: ReactNode;
  title: string;
  text?: string;
  tone?: keyof ReturnType<typeof useStyles>['artBg'];
  actions?: ReactNode;
  /** Announce on appearance (errors, confirmations). */
  live?: boolean;
};

export function EmptyState({ art, title, text, tone = 'default', actions, live }: Props) {
  const { artBg, styles } = useStyles();
  return (
    <View
      style={styles.root}
      accessibilityRole={live ? (tone === 'danger' ? 'alert' : 'summary') : undefined}
      accessibilityLiveRegion={live ? 'polite' : undefined}
    >
      <View style={[styles.art, { backgroundColor: artBg[tone] }]}>{art}</View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}
