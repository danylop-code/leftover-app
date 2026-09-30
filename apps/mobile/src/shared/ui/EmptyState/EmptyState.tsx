import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { artBg, styles } from './styles';

type Props = {
  art: ReactNode;
  title: string;
  text?: string;
  tone?: keyof typeof artBg;
  actions?: ReactNode;
  /** Announce on appearance (errors, confirmations). */
  live?: boolean;
};

export function EmptyState({ art, title, text, tone = 'default', actions, live }: Props) {
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
