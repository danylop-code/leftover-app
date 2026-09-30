import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SINGLE_LINE } from '../../constants/ui';
import { IconButton } from '../IconButton/IconButton';
import type { IconName } from '../icons';
import { useStyles } from './styles';

type Props = {
  title?: string;
  onBack?: () => void;
  backIcon?: Extract<IconName, 'back' | 'close'>;
  right?: ReactNode;
};

/** Top bar (`.hdr`): back/close, centered title, optional right action. */
export function Header({ title, onBack, backIcon = 'back', right }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.bar}>
      {onBack ? (
        <IconButton
          icon={backIcon}
          label={backIcon === 'close' ? t('ui.close') : t('ui.back')}
          onPress={onBack}
        />
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={styles.title} accessibilityRole="header" numberOfLines={SINGLE_LINE}>
        {title}
      </Text>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}
