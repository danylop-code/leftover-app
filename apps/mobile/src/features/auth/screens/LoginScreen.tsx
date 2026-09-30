import { LoginBody } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Banner, Button, Field, Header, Input, Screen } from '../../../shared/ui';
import { useLogin } from '../api/use-login';
import { FooterLink } from '../components/FooterLink/FooterLink';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { type FieldErrors, useFormErrors } from '../hooks/use-form-errors';
import { useStyles } from './styles';

// "Forgot password?" is out of scope (03 brief) and not rendered.
export function LoginScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const login = useLogin();
  const { fromZod, fromRequest } = useFormErrors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);

  const submit = () => {
    const parsed = LoginBody.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fromZod(parsed.error));
      return;
    }
    setErrors({});
    setBanner(null);
    login.mutate(parsed.data, {
      onError: (error) => {
        const mapped = fromRequest(error);
        setErrors(mapped.fields);
        setBanner(mapped.banner);
      },
    });
  };

  return (
    <Screen scroll header={<Header onBack={() => router.replace('/welcome')} />}>
      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title} accessibilityRole="header">
            {t('auth.login.title')}
          </Text>
          <Text style={styles.body}>{t('auth.login.subtitle')}</Text>
        </View>
        {banner ? <Banner tone="danger" title={banner} /> : null}
        <View style={styles.form}>
          <Field label={t('auth.login.email')} error={errors.email}>
            <Input
              icon="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </Field>
          <Field label={t('auth.login.password')} error={errors.password}>
            <PasswordInput
              icon="lock"
              value={password}
              onChangeText={setPassword}
              autoComplete="current-password"
            />
          </Field>
          <Button block label={t('auth.login.submit')} loading={login.isPending} onPress={submit} />
        </View>
        <FooterLink
          prompt={t('auth.login.newHere')}
          action={t('auth.login.createAccount')}
          onPress={() => router.replace('/register')}
        />
      </View>
    </Screen>
  );
}
