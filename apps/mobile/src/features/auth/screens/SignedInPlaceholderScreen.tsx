import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSession } from '../../../shared/store/session';
import { Button, HeaderLarge, Screen } from '../../../shared/ui';
import { useLogout } from '../api/use-logout';
import { styles } from './styles';

const titles = {
  discover: 'tabs.discover',
  orders: 'tabs.orders',
  profile: 'tabs.profile',
  bags: 'tabs.bags',
  location: 'auth.placeholder.location',
  setup: 'auth.placeholder.setup',
} as const;

type Props = { screen: keyof typeof titles };

/**
 * Stand-in for screens owned by later features (04 setup, 05 location, 06 Discover, 10/12 Orders,
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
