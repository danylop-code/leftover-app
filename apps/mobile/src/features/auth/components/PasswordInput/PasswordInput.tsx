import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextInputProps } from 'react-native';
import { IconButton, type IconName, Input } from '../../../../shared/ui';
import { useStyles } from './styles';

type Props = Omit<TextInputProps, 'style' | 'secureTextEntry'> & { icon?: IconName };

/** Password field with a show/hide toggle. Use inside <Field>. */
export function PasswordInput({ icon, ...rest }: Props) {
  const { toggleColor } = useStyles();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <Input
      icon={icon}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      right={
        <IconButton
          icon={visible ? 'eyeOff' : 'eye'}
          iconSize="md"
          size="sm"
          color={toggleColor}
          label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
          onPress={() => setVisible((v) => !v)}
        />
      }
      {...rest}
    />
  );
}
