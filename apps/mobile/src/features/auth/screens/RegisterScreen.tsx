import { RegisterBody, type Role } from '@leftover/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Banner, Button, Field, Header, Input, Screen } from '../../../shared/ui';
import { useRegister } from '../api/use-register';
import { FooterLink } from '../components/FooterLink/FooterLink';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { RoleCard } from '../components/RoleCard/RoleCard';
import { type FieldErrors, useFormErrors } from '../hooks/use-form-errors';
import { styles } from './styles';

export function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const register = useRegister();
  const { fromZod, fromRequest } = useFormErrors();
  const [role, setRole] = useState<Role>('customer');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);

  const submit = () => {
    const parsed = RegisterBody.safeParse({ role, firstName, email, password });
    if (!parsed.success) {
      setErrors(fromZod(parsed.error));
      return;
    }
    setErrors({});
    setBanner(null);
    // On success the session changes and the (auth) layout routes to onboarding.
    register.mutate(parsed.data, {
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
        <View style={styles.introTight}>
          <Text style={styles.title} accessibilityRole="header">
            {t('auth.register.title')}
          </Text>
          <Text style={styles.body}>{t('auth.register.subtitle')}</Text>
        </View>
        <View
          style={styles.roles}
          accessibilityRole="radiogroup"
          accessibilityLabel={t('auth.register.roleLegend')}
        >
          <RoleCard
            kind="customer"
            title={t('auth.register.customer')}
            hint={t('auth.register.customerHint')}
            selected={role === 'customer'}
            onSelect={() => setRole('customer')}
          />
          <RoleCard
            kind="store"
            title={t('auth.register.store')}
            hint={t('auth.register.storeHint')}
            selected={role === 'store'}
            onSelect={() => setRole('store')}
          />
        </View>
        {banner ? <Banner tone="danger" title={banner} /> : null}
        <View style={styles.form}>
          <Field label={t('auth.register.firstName')} error={errors.firstName}>
            <Input
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
              textContentType="givenName"
            />
          </Field>
          <Field label={t('auth.register.email')} error={errors.email}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.register.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </Field>
          <Field label={t('auth.register.password')} error={errors.password}>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.register.passwordPlaceholder')}
              autoComplete="new-password"
              textContentType="newPassword"
            />
          </Field>
          <Button
            block
            label={t('auth.register.submit')}
            loading={register.isPending}
            onPress={submit}
          />
        </View>
        <FooterLink
          prompt={t('auth.register.haveAccount')}
          action={t('auth.register.login')}
          onPress={() => router.replace('/login')}
        />
      </View>
    </Screen>
  );
}
