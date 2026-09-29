import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useLogout } from '../../../shared/api/use-logout';
import { useSession } from '../../../shared/store/session';
import { Button, HeaderLarge, Screen } from '../../../shared/ui';
import { styles } from './styles';

const titles = {
  orders: 'tabs.orders',
  profile: 'tabs.profile',
  bags: 'tabs.bags',
  setup: 'auth.placeholder.setup',
} as const;

type Props = { screen: keyof typeof titles };

/**
 * Stand-in for screens owned by later features (10/12 Orders,
 * 11 Bags, 15 Profile). Shows who is signed in and offers Log out. Replaced route by route.
 */
export function SignedInPlaceholderScreen({ screen }: Props) {
  const { t } = useTranslation();
  const user = useSession((s) => s.user);
  const logout = useLogout();
  return (
    <Screen header={<HeaderLarge title={t(titles[screen])} />}>
      <View style={styles.placeholder}>
        <Text style={styles.body}>{t('auth.placeholder.comingSoon')}</Text>
        {user ? (
          <Text style={styles.body}>
            {t('auth.placeholder.signedInAs', { name: user.firstName, email: user.email })}
          </Text>
        ) : null}
        <Button
          variant="secondary"
          icon="logout"
          label={t('auth.placeholder.logout')}
          loading={logout.isPending}
          onPress={() => logout.mutate()}
        />
      </View>
    </Screen>
  );
}
