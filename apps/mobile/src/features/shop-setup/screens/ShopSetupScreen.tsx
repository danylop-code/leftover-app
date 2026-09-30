import { type Category, type LatLng, StoreProfileBody } from '@leftover/shared';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ApiError, NetworkError } from '../../../shared/api/client';
import { useLogout } from '../../../shared/api/use-logout';
import { DEFAULT_MAP_CENTER } from '../../../shared/constants/map';
import { normalizeTime } from '../../../shared/lib/time';
import {
  Banner,
  Button,
  Field,
  Header,
  IconButton,
  Input,
  MapPicker,
  Screen,
} from '../../../shared/ui';
import { useCreateStore } from '../api/use-create-store';
import { CategoryPicker } from '../components/CategoryPicker/CategoryPicker';
import { useGeocode } from '../hooks/use-geocode';
import { styles } from './styles';

type FieldName = 'name' | 'category' | 'address' | 'opensAt' | 'closesAt' | 'pin';
type Errors = Partial<Record<FieldName, string>>;
type PinStatus = 'none' | 'searching' | 'found' | 'notFound' | 'moved';

/** Not in the design: built from the kit after Register when the role is shop (brief 04). */
export function ShopSetupScreen() {
  const { t } = useTranslation();
  const geocode = useGeocode();
  const createStore = useCreateStore();
  const logout = useLogout();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<LatLng>(DEFAULT_MAP_CENTER);
  const [pinStatus, setPinStatus] = useState<PinStatus>('none');
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const lookedUp = useRef('');

  const pinPlaced = pinStatus === 'found' || pinStatus === 'moved';

  const findAddress = async () => {
    const query = address.trim();
    if (!query || query === lookedUp.current) return;
    lookedUp.current = query;
    setPinStatus('searching');
    const found = await geocode(query);
    if (found) {
      setLocation(found);
      setPinStatus('found');
      setErrors((e) => ({ ...e, pin: undefined }));
    } else {
      setPinStatus('notFound');
    }
  };

  const movePin = (next: LatLng) => {
    // Fine-tuning the pin never rewrites the address the owner typed.
    setLocation(next);
    setPinStatus('moved');
    setErrors((e) => ({ ...e, pin: undefined }));
  };

  const validate = () => {
    const parsed = StoreProfileBody.safeParse({
      name,
      category: category ?? undefined,
      address,
      lat: location.lat,
      lng: location.lng,
      opensAt,
      closesAt,
    });
    const next: Errors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (next[field]) continue;
        if (field === 'closesAt' && issue.code === 'custom')
          next.closesAt = t('shopSetup.errors.closesAfterOpens');
        else if (field === 'opensAt' || field === 'closesAt')
          next[field] = t('shopSetup.errors.time');
        else if (field === 'name' || field === 'category' || field === 'address')
          next[field] = t(`shopSetup.errors.${field}`);
      }
    }
    if (!pinPlaced) next.pin = t('shopSetup.errors.pin');
    setErrors(next);
    return parsed.success && pinPlaced ? parsed.data : null;
  };

  const submit = () => {
    const body = validate();
    if (!body) return;
    setBanner(null);
    createStore.mutate(body, {
      onError: (error) => {
        if (error instanceof ApiError && error.code === 'store_exists') return;
        setBanner(error instanceof NetworkError ? t('errors.network') : t('errors.generic'));
      },
    });
  };

  const statusText =
    pinStatus === 'searching'
      ? t('shopSetup.searching')
      : pinStatus === 'found'
        ? t('shopSetup.found')
        : pinStatus === 'moved'
          ? t('shopSetup.moved')
          : pinStatus === 'notFound'
            ? t('shopSetup.notFound')
            : t('shopSetup.addressHelp');

  return (
    <Screen
      scroll
      header={
        <Header
          right={
            <IconButton
              icon="logout"
              label={t('shopSetup.logout')}
              onPress={() => logout.mutate()}
            />
          }
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title} accessibilityRole="header">
            {t('shopSetup.title')}
          </Text>
          <Text style={styles.body}>{t('shopSetup.subtitle')}</Text>
        </View>
        {banner ? <Banner tone="danger" title={banner} /> : null}
        <View style={styles.form}>
          <Field label={t('shopSetup.name')} error={errors.name}>
            <Input value={name} onChangeText={setName} autoCapitalize="words" />
          </Field>
          <Field label={t('shopSetup.category')} error={errors.category}>
            <CategoryPicker
              value={category}
              onChange={setCategory}
              label={t('shopSetup.category')}
            />
          </Field>
          <Field label={t('shopSetup.address')} error={errors.address}>
            <Input
              icon="search"
              value={address}
              onChangeText={setAddress}
              onSubmitEditing={findAddress}
              onBlur={findAddress}
              placeholder={t('shopSetup.addressPlaceholder')}
              returnKeyType="search"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
            />
          </Field>
          <View style={styles.group}>
            <MapPicker value={location} onChange={movePin} label={t('shopSetup.map')} />
            <Text
              style={errors.pin || pinStatus === 'notFound' ? styles.statusError : styles.status}
              accessibilityLiveRegion="polite"
            >
              {errors.pin ?? statusText}
            </Text>
          </View>
          <View style={styles.group}>
            <Text style={styles.groupLabel}>{t('shopSetup.hours')}</Text>
            <View style={styles.hours}>
              <View style={styles.hour}>
                <Field label={t('shopSetup.opensAt')} error={errors.opensAt}>
                  <Input
                    value={opensAt}
                    onChangeText={setOpensAt}
                    onBlur={() => setOpensAt(normalizeTime)}
                    placeholder={t('shopSetup.timePlaceholder')}
                    keyboardType="numbers-and-punctuation"
                  />
                </Field>
              </View>
              <View style={styles.hour}>
                <Field label={t('shopSetup.closesAt')} error={errors.closesAt}>
                  <Input
                    value={closesAt}
                    onChangeText={setClosesAt}
                    onBlur={() => setClosesAt(normalizeTime)}
                    placeholder={t('shopSetup.timePlaceholder')}
                    keyboardType="numbers-and-punctuation"
                  />
                </Field>
              </View>
            </View>
          </View>
          <Button
            block
            label={t('shopSetup.submit')}
            loading={createStore.isPending}
            onPress={submit}
          />
        </View>
      </View>
    </Screen>
  );
}
