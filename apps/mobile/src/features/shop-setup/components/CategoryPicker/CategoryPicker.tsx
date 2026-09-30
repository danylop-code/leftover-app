import { Category } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Chip } from '../../../../shared/ui';
import { styles } from './styles';

type Props = { value: Category | null; onChange: (category: Category) => void; label: string };

/** Single-choice chips for every category, including Other. */
export function CategoryPicker({ value, onChange, label }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {Category.options.map((c) => (
        <Chip
          key={c}
          label={t(`categories.${c}`)}
          selected={value === c}
          onPress={() => onChange(c)}
        />
      ))}
    </View>
  );
}
