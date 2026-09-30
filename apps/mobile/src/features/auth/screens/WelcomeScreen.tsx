import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Button, Screen } from '../../../shared/ui';
import { WelcomeHero } from '../components/WelcomeHero/WelcomeHero';
import { useStyles } from './styles';

export function WelcomeScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <WelcomeHero />
      <View style={styles.welcomeBody}>
        <Text style={styles.wordmark} accessibilityRole="header">
          {t('app.name')}
        </Text>
        <Text style={styles.title}>{t('auth.welcome.title')}</Text>
        <Text style={styles.body}>{t('auth.welcome.body')}</Text>
        <View style={styles.actions}>
          <Button
            block
            label={t('auth.welcome.getStarted')}
            onPress={() => router.push('/register')}
          />
          <Button
            block
            variant="ghost"
            label={t('auth.welcome.haveAccount')}
            onPress={() => router.push('/login')}
          />
        </View>
      </View>
    </Screen>
  );
}
