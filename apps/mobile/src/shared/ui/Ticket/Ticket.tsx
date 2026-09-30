import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Icon } from '../icons';
import { useStyles } from './styles';

type Props = {
  code: string;
  bandLabel: string;
  /** Under the code, e.g. "1 × Bakery surprise bag · pay ₴149 in store". */
  summary?: ReactNode;
  /** Below the perforation, e.g. the store row with Directions. */
  footer?: ReactNode;
  accessibilityLabel?: string;
};

/** Pickup code ticket (`.ticket`); the code is read digit by digit. */
export function Ticket({ code, bandLabel, summary, footer, accessibilityLabel }: Props) {
  const { bandIconColor, styles } = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.ticket} accessibilityLabel={accessibilityLabel}>
      <View style={styles.band}>
        <Icon name="bag" color={bandIconColor} />
        <Text style={styles.bandText}>{bandLabel}</Text>
      </View>
      <View style={styles.main}>
        <Text
          style={styles.code}
          accessibilityLabel={t('ui.ticket.codeLabel', { digits: code.split('').join(' ') })}
        >
          {code}
        </Text>
        {summary}
      </View>
      {footer ? (
        <>
          <View style={styles.cut}>
            <View style={styles.dash} />
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={[styles.notch, styles.notchRight]} />
          </View>
          <View style={styles.bottom}>{footer}</View>
        </>
      ) : null}
    </View>
  );
}
