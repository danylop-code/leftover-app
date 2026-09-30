import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

type Props = { label?: string; children: ReactNode };

/** A titled card of ListRows (`.group-label` + `.list`). */
export function ListGroup({ label, children }: Props) {
  return (
    <View style={styles.group}>
      {label ? (
        <Text style={styles.groupLabel} accessibilityRole="header">
          {label}
        </Text>
      ) : null}
      <View style={styles.list}>{children}</View>
    </View>
  );
}
