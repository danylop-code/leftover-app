import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Icon } from '../icons';
import { FieldContext } from './field-context';
import { useStyles } from './styles';

type Props = {
  label: string;
  children: ReactNode;
  help?: string;
  error?: string | null;
  optional?: boolean;
  count?: number;
  maxCount?: number;
};

/** Label + control + help/error line + optional character counter. The error replaces the help. */
export function Field({ label, children, help, error, optional, count, maxCount }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const invalid = Boolean(error);
  const over = count !== undefined && maxCount !== undefined && count > maxCount;
  return (
    <FieldContext.Provider value={{ label, invalid: invalid || over }}>
      <View style={styles.root}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {optional ? <Text style={styles.optional}>{t('ui.field.optional')}</Text> : null}
        </View>
        {children}
        {error || help || maxCount !== undefined ? (
          <View style={styles.foot}>
            {error ? (
              <View
                style={styles.errorRow}
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
              >
                <Icon name="alert" size="sm" color={styles.error.color} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : help ? (
              <Text style={styles.help}>{help}</Text>
            ) : null}
            {maxCount !== undefined ? (
              <Text style={[styles.counter, over && styles.counterOver]}>
                {t('ui.field.counter', { value: count ?? 0, max: maxCount })}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </FieldContext.Provider>
  );
}
