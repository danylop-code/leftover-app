import type { Store } from '@leftover/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { UploadFile } from '../../../../shared/api/client';
import { type ImageTarget, useImageUpload } from '../../../../shared/api/use-image-upload';
import { PhotoField } from '../../../../shared/ui';
import { useStyles } from './styles';

/** One of the shop's images, uploaded as soon as it's picked; Retry resends a failed one. */
function ShopImage({
  store,
  slot,
  label,
}: {
  store: Store;
  slot: 'logo' | 'cover';
  label: string;
}) {
  const { t } = useTranslation();
  const upload = useImageUpload();
  const [failed, setFailed] = useState<UploadFile | null | undefined>(undefined);
  const target: ImageTarget = { kind: slot };
  const send = (file: UploadFile | null) => {
    setFailed(undefined);
    upload.mutate({ target, file }, { onError: () => setFailed(file) });
  };
  const current = slot === 'logo' ? store.logoUrl : store.coverUrl;
  return (
    <PhotoField
      label={label}
      preview={
        slot === 'logo'
          ? { shape: 'logo', id: store.id, name: store.name }
          : { shape: 'cover', category: store.category }
      }
      value={upload.isPending ? (upload.variables?.file?.uri ?? null) : current}
      onPick={send}
      onRemove={() => send(null)}
      progress={upload.progress}
      error={failed !== undefined ? t('ui.photo.failed') : null}
      onRetry={failed !== undefined ? () => send(failed) : undefined}
    />
  );
}

/** Profile (shop owners): logo and cover, the same as in shop setup (brief 20). */
export function ShopPhotos({ store }: { store: Store }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{t('profile.shopPhotos')}</Text>
      <View style={styles.card}>
        <ShopImage store={store} slot="logo" label={t('shopSetup.logo')} />
        <ShopImage store={store} slot="cover" label={t('shopSetup.cover')} />
      </View>
    </View>
  );
}
