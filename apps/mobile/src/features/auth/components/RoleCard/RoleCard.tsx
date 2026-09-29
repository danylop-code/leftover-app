import type { Role } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../../../../shared/ui';
import { styles, tint } from './styles';

type Props = { kind: Role; title: string; hint: string; selected: boolean; onSelect: () => void };

/** One option of the Register role picker (`.role`); a radio button. */
export function RoleCard({ kind, title, hint, selected, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t('ui.pair', { label: title, value: hint })}
      onPress={onSelect}
      style={[styles.card, selected && styles.selected]}
    >
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? <Icon name="check" size="sm" color={tint.checkMark} /> : null}
      </View>
      <View style={[styles.tile, kind === 'customer' ? styles.tileCustomer : styles.tileStore]}>
        <Icon name={kind === 'customer' ? 'bag' : 'store'} size="lg" color={tint[kind]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </Pressable>
  );
}
