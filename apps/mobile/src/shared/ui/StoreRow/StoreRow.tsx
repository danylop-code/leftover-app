import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SINGLE_LINE } from '../../constants/ui';
import { Icon } from '../icons';
import { StoreLogo } from '../StoreLogo/StoreLogo';
import { chevronColor, styles } from './styles';

type Props = {
  storeId: string;
  name: string;
  meta?: string;
  onPress?: () => void;
  /** Replaces the chevron (e.g. a Directions button). */
  trailing?: ReactNode;
};

/** Store summary row (`.store-row`): logo, name, meta, chevron. */
export function StoreRow({ storeId, name, meta, onPress, trailing }: Props) {
  const inner = (
    <>
      <StoreLogo id={storeId} name={name} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={SINGLE_LINE}>
          {name}
        </Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {trailing ?? (onPress ? <Icon name="chevronRight" color={chevronColor} /> : null)}
    </>
  );
  if (!onPress) return <View style={styles.row}>{inner}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {inner}
    </Pressable>
  );
}
