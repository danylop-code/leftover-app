import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useFieldContext } from '../Field/field-context';
import { useStyles as useFieldStyles } from '../Field/styles';
import { Icon } from '../icons';
import { useStyles } from './styles';

type Props = { value: string; onChange: (hhmm: string) => void };

/** Web sibling (brief 17): the browser's own time input, styled as a kit field. */
export function TimeField({ value, onChange }: Props) {
  const { webInput } = useStyles();
  const { iconColor, inputStyles } = useFieldStyles();
  const { t } = useTranslation();
  const { label, invalid } = useFieldContext();
  return (
    <View style={[inputStyles.wrap, invalid && inputStyles.error]}>
      <Icon name="clock" color={iconColor} />
      <input
        type="time"
        aria-label={label ?? t('ui.time.choose')}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        style={webInput}
      />
    </View>
  );
}
