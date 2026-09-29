import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '../icons';
import { iconColor, styles } from './styles';

type Props = {
  label: string;
  icon?: IconName;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
  last?: boolean;
};

/** Settings-style row (`.list-row`). Pressable only when `onPress` is given. */
export function ListRow({
  label,
  icon,
  value,
  onPress,
  danger,
  chevron = Boolean(onPress),
  last,
}: Props) {
  const { t } = useTranslation();
  const content = (
    <>
      {icon ? (
        <View style={[styles.icon, danger && styles.iconDanger]}>
          <Icon name={icon} color={danger ? iconColor.danger : iconColor.default} />
        </View>
      ) : null}
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {chevron ? <Icon name="chevronRight" color={iconColor.chevron} /> : null}
    </>
  );
  if (!onPress) {
    return (
      <View style={[styles.row, last && styles.last]} accessible>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? t('ui.pair', { label, value }) : label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, last && styles.last, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}
