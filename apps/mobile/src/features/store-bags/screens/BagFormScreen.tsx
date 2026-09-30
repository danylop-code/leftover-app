import type { BagBody } from '@leftover/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ApiError, NetworkError } from '../../../shared/api/client';
import { useImageUpload } from '../../../shared/api/use-image-upload';
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
import { BagForm, type BagFormErrors, type PhotoChange } from '../components/BagForm/BagForm';
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
  const upload = useImageUpload();
  const [photoError, setPhotoError] = useState<string | null>(null);
  // A new bag that saved but whose photo didn't upload: saving again updates it, never adds twice.
  const [savedId, setSavedId] = useState<string | undefined>(undefined);
  const [pendingPhoto, setPendingPhoto] = useState<PhotoChange>(undefined);

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

  /** Applies the photo change to a saved bag; the form stays open with Retry if it fails. */
  const sendPhoto = (bagId: string, photo: PhotoChange) => {
    if (photo === undefined) return close();
    setPhotoError(null);
    upload.mutate(
      { target: { kind: 'bagPhoto', bagId }, file: photo },
      {
        onSuccess: () => {
          setPendingPhoto(undefined);
          close();
        },
        onError: () => setPhotoError(t('ui.photo.failed')),
      },
    );
  };

  const submit = (body: BagBody, photo: PhotoChange) => {
    setServerErrors({});
    setBanner(null);
    setPendingPhoto(photo);
    save.mutate(
      { id: id ?? savedId, body },
      {
        onSuccess: (bag) => {
          setSavedId(bag.id);
          sendPhoto(bag.id, photo);
        },
        onError: showError,
      },
    );
  };

  const retryPhoto = () => {
    const bagId = id ?? savedId;
    if (bagId) sendPhoto(bagId, pendingPhoto);
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
        photoProgress={upload.progress}
        photoError={photoError}
        onRetryPhoto={retryPhoto}
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
