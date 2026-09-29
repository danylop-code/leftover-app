import type { BagBody } from '@leftover/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ApiError, NetworkError } from '../../../shared/api/client';
import {
  Button,
  EmptyBagArt,
  EmptyState,
  Header,
  Screen,
  Sheet,
  Skeleton,
} from '../../../shared/ui';
import { useDeleteBag, useSaveBag } from '../api/use-bag-mutations';
import { useShopBags } from '../api/use-shop-bags';
import { BagForm, type BagFormErrors } from '../components/BagForm/BagForm';
import { useStyles } from './styles';

/** AddBag artboard, for adding (`/bag/new`) and editing (`/bag/[id]`) a bag. */
export function BagFormScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const bags = useShopBags();
  const save = useSaveBag();
  const remove = useDeleteBag();
  const [serverErrors, setServerErrors] = useState<BagFormErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/bags'));
  const editing = id ? bags.data?.bags.find((b) => b.id === id) : undefined;
  const header = (
    <Header
      title={id ? t('bagForm.editTitle') : t('bagForm.addTitle')}
      onBack={close}
      backIcon="close"
    />
  );

  const showError = (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.code === 'below_reserved') {
        setServerErrors({
          qty: t('bagForm.errors.belowReserved', { count: Number(error.details.reservedCount) }),
        });
        return;
      }
      if (error.code === 'validation' && error.fields) {
        setServerErrors({
          from: error.fields.pickupStart ? t('bagForm.errors.windowPast') : undefined,
          until: error.fields.pickupEnd ? t('bagForm.errors.windowPast') : undefined,
        });
        return;
      }
      if (error.code === 'has_reservations') return setBanner(t('bagForm.errors.hasReservations'));
      if (error.code === 'has_orders') return setBanner(t('bagForm.errors.hasOrders'));
      if (error.status === 404) return setBanner(t('bagForm.errors.notFound'));
    }
    setBanner(error instanceof NetworkError ? t('errors.network') : t('errors.generic'));
  };

  const submit = (body: BagBody) => {
    setServerErrors({});
    setBanner(null);
    save.mutate({ id, body }, { onSuccess: close, onError: showError });
  };

  const deleteBag = () => {
    if (!id) return;
    setBanner(null);
    remove.mutate(id, {
      onSuccess: () => {
        setConfirmDelete(false);
        close();
      },
      onError: (error) => {
        setConfirmDelete(false);
        showError(error);
      },
    });
  };

  if (bags.isPending) {
    return (
      <Screen header={header}>
        <View style={styles.form} accessible accessibilityState={{ busy: true }}>
          <Skeleton style={styles.skeletonRow} />
          <Skeleton style={styles.skeletonRow} />
        </View>
      </Screen>
    );
  }

  if (!bags.data || (id && !editing)) {
    return (
      <Screen header={header}>
        <View style={styles.formCentered}>
          <EmptyState
            live
            art={<EmptyBagArt />}
            title={t('bagForm.errors.notFound')}
            actions={<Button label={t('storeDetail.notFound.back')} onPress={close} />}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll header={header}>
      <BagForm
        initial={editing}
        timezone={bags.data.timezone}
        saving={save.isPending}
        deleting={remove.isPending}
        serverErrors={serverErrors}
        banner={banner}
        onSave={submit}
        onDelete={id ? () => setConfirmDelete(true) : undefined}
      />
      <Sheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('bagForm.deleteSheet.title')}
        text={t('bagForm.deleteSheet.text')}
      >
        <Button
          block
          variant="danger"
          label={t('bagForm.deleteSheet.confirm')}
          loading={remove.isPending}
          onPress={deleteBag}
        />
        <Button
          block
          variant="secondary"
          label={t('ui.sheet.cancel')}
          onPress={() => setConfirmDelete(false)}
        />
      </Sheet>
    </Screen>
  );
}
