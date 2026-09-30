import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text } from 'react-native';
import { dateForTime, timeOfDate } from '../../lib/time-of-day';
import { useTheme } from '../../theme';
import { Button } from '../Button/Button';
import { useFieldContext } from '../Field/field-context';
import { useStyles as useFieldStyles } from '../Field/styles';
import { Icon } from '../icons';
import { Sheet } from '../Sheet/Sheet';
import { useStyles } from './styles';

type Props = {
  /** `HH:mm`, or '' when not chosen yet. */
  value: string;
  onChange: (hhmm: string) => void;
};

/**
 * A time of day chosen with the platform's picker, not typed: the system dialog on Android,
 * a spinner in a sheet on iOS (the web sibling uses the browser's time input). Sits inside a
 * <Field>, which gives it its label and error state.
 */
export function TimeField({ value, onChange }: Props) {
  const { pickerTextColor, styles } = useStyles();
  const { scheme } = useTheme();
  const { iconColor, inputStyles } = useFieldStyles();
  const { t } = useTranslation();
  const { label, invalid } = useFieldContext();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => dateForTime(value));

  const pick = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateForTime(value),
        mode: 'time',
        is24Hour: true,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(timeOfDate(date));
        },
      });
      return;
    }
    setDraft(dateForTime(value));
    setOpen(true);
  };

  const done = () => {
    onChange(timeOfDate(draft));
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('ui.time.label', { label, value: value || t('ui.time.none') })}
        onPress={pick}
        style={[inputStyles.wrap, open && inputStyles.focus, invalid && inputStyles.error]}
      >
        <Icon name="clock" color={iconColor} />
        <Text style={value ? styles.value : styles.placeholder}>
          {value || t('ui.time.choose')}
        </Text>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label ?? ''}>
        <DateTimePicker
          testID="time-picker"
          value={draft}
          mode="time"
          display="spinner"
          style={styles.picker}
          themeVariant={scheme}
          textColor={pickerTextColor}
          is24Hour
          locale="en-GB"
          onChange={(_event, date) => date && setDraft(date)}
        />
        <Button block label={t('ui.time.done')} onPress={done} />
      </Sheet>
    </>
  );
}
