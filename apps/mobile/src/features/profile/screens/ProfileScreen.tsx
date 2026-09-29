import { UpdateMeBody } from '@leftover/shared';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useLogout } from '../../../shared/api/use-logout';
import { LANGUAGE_NAMES, LANGUAGES } from '../../../shared/i18n/languages';
import { useLanguage } from '../../../shared/i18n/use-language';
import { useLocation } from '../../../shared/store/location';
import { Appearance, usePreferences } from '../../../shared/store/preferences';
import { useSession } from '../../../shared/store/session';
import {
  Button,
  ChoiceList,
  Field,
  HeaderLarge,
  Input,
  ListGroup,
  ListRow,
  Screen,
  Sheet,
  useTabBarInset,
} from '../../../shared/ui';
import { useMyShop, useMyStats, useUpdateMe } from '../api/use-profile';
import { ProfileCard } from '../components/ProfileCard/ProfileCard';
import { ShopPhotos } from '../components/ShopPhotos/ShopPhotos';
import { useStyles } from './styles';

/**
 * Settings artboard (the Profile tab) for both roles. Customers also see their impact and
 * pickup area; shops don't. Notifications isn't shown (no push in the MVP).
 */
export function ProfileScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const isCustomer = user?.role === 'customer';
  const place = useLocation((s) => s.selected);
  const radiusKm = useLocation((s) => s.radiusKm);
  const stats = useMyStats(isCustomer);
  const shop = useMyShop(user?.role === 'store' && Boolean(user.storeId));
  const updateMe = useUpdateMe();
  const logout = useLogout();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [choosingLanguage, setChoosingLanguage] = useState(false);
  const { language } = useLanguage();
  const setLanguage = usePreferences((s) => s.setLanguage);
  const [choosingAppearance, setChoosingAppearance] = useState(false);
  const appearance = usePreferences((s) => s.appearance);
  const setAppearance = usePreferences((s) => s.setAppearance);
  const tabBarInset = useTabBarInset();

  if (!user) return null;

  const startEdit = () => {
    setName(user.firstName);
    setNameError(null);
    setEditing(true);
  };

  const saveName = () => {
    const parsed = UpdateMeBody.safeParse({ firstName: name });
    if (!parsed.success) {
      setNameError(t('profile.editSheet.error'));
      return;
    }
    updateMe.mutate(parsed.data, {
      onSuccess: () => setEditing(false),
      onError: () => setNameError(t('errors.generic')),
    });
  };

  const version = Constants.expoConfig?.version ?? '';

  return (
    <Screen scroll bottomInset={tabBarInset} header={<HeaderLarge title={t('profile.title')} />}>
      <View style={styles.content}>
        <ProfileCard user={user} stats={isCustomer ? stats.data : undefined} onEdit={startEdit} />

        {shop.data ? <ShopPhotos store={shop.data} /> : null}

        <ListGroup label={t('profile.preferences')}>
          <ListRow
            icon="globe"
            label={t('profile.language')}
            value={LANGUAGE_NAMES[language]}
            onPress={() => setChoosingLanguage(true)}
          />
          <ListRow
            icon="moon"
            label={t('profile.appearance')}
            value={t(`profile.appearanceValue.${appearance}`)}
            onPress={() => setChoosingAppearance(true)}
            last={!isCustomer}
          />
          {isCustomer ? (
            <ListRow
              icon="pin"
              label={t('profile.pickupArea')}
              value={
                place
                  ? t('profile.pickupAreaValue', { label: place.label, km: radiusKm })
                  : undefined
              }
              onPress={() => router.push('/location')}
              last
            />
          ) : null}
        </ListGroup>

        <ListGroup label={t('profile.help')}>
          <ListRow icon="flag" label={t('profile.report')} onPress={() => router.push('/report')} />
          <ListRow
            icon="logout"
            label={t('profile.logout')}
            danger
            chevron={false}
            onPress={() => setConfirmLogout(true)}
            last
          />
        </ListGroup>

        {version ? <Text style={styles.version}>{t('profile.version', { version })}</Text> : null}
      </View>

      <Sheet
        visible={editing}
        onClose={() => setEditing(false)}
        title={t('profile.editSheet.title')}
      >
        <Field label={t('profile.editSheet.field')} error={nameError}>
          <Input value={name} onChangeText={setName} autoCapitalize="words" autoFocus />
        </Field>
        <Button
          block
          label={t('profile.editSheet.save')}
          loading={updateMe.isPending}
          onPress={saveName}
        />
      </Sheet>

      <Sheet
        visible={choosingLanguage}
        onClose={() => setChoosingLanguage(false)}
        title={t('profile.languageSheet.title')}
      >
        <ChoiceList
          label={t('profile.languageSheet.title')}
          options={LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
          value={language}
          onChange={(next) => {
            setLanguage(next);
            setChoosingLanguage(false);
          }}
        />
      </Sheet>

      <Sheet
        visible={choosingAppearance}
        onClose={() => setChoosingAppearance(false)}
        title={t('profile.appearance')}
      >
        <ChoiceList
          label={t('profile.appearance')}
          options={Appearance.options.map((a) => ({
            value: a,
            label: t(`profile.appearanceValue.${a}`),
          }))}
          value={appearance}
          onChange={(next) => {
            setAppearance(next);
            setChoosingAppearance(false);
          }}
        />
      </Sheet>

      <Sheet
        visible={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title={t('profile.logoutSheet.title')}
        text={t('profile.logoutSheet.text')}
      >
        <Button
          block
          variant="danger"
          label={t('profile.logoutSheet.confirm')}
          loading={logout.isPending}
          onPress={() => logout.mutate()}
        />
        <Button
          block
          variant="secondary"
          label={t('ui.sheet.cancel')}
          onPress={() => setConfirmLogout(false)}
        />
      </Sheet>
    </Screen>
  );
}
