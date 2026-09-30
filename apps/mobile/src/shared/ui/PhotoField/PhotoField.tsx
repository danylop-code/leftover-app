import type { Category } from '@leftover/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { UploadFile } from '../../api/client';
import { type ImageSource, pickImage } from '../../lib/pick-image';
import { Button } from '../Button/Button';
import { CategoryMedia } from '../CategoryMedia/CategoryMedia';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Sheet } from '../Sheet/Sheet';
import { StoreLogo } from '../StoreLogo/StoreLogo';
import { useStyles } from './styles';

type Preview =
  | { shape: 'media'; category: Category }
  | { shape: 'cover'; category: Category }
  | { shape: 'logo'; id: string; name: string };

type Props = {
  label: string;
  preview: Preview;
  /** The current image: an API path, or a picked file's local URI. */
  value: string | null;
  onPick: (file: UploadFile) => void;
  onRemove?: () => void;
  /** 0–1 while uploading. */
  progress?: number | null;
  /** Upload failed: shown with a Retry button. */
  error?: string | null;
  onRetry?: () => void;
  help?: string;
};

/**
 * An optional photo (brief 20): preview over its placeholder, then add/change/remove. Taking or
 * choosing a photo happens in a sheet; the picked file is shrunk before `onPick`.
 */
export function PhotoField({
  label,
  preview,
  value,
  onPick,
  onRemove,
  progress,
  error,
  onRetry,
  help,
}: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const [choosing, setChoosing] = useState(false);
  const [denied, setDenied] = useState(false);
  const uploading = progress !== null && progress !== undefined;

  const choose = async (source: ImageSource) => {
    setChoosing(false);
    const result = await pickImage(source);
    setDenied(result.status === 'denied');
    if (result.status === 'picked') onPick(result.file);
  };

  const image =
    preview.shape === 'logo' ? (
      <StoreLogo id={preview.id} name={preview.name} size="lg" logo={value} />
    ) : (
      <CategoryMedia
        category={preview.category}
        variant={preview.shape === 'cover' ? 'small' : 'tile'}
        photo={value}
      />
    );

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {image}
        <View style={styles.actions}>
          <Button
            size="sm"
            variant="secondary"
            icon="camera"
            label={value ? t('ui.photo.change') : t('ui.photo.add')}
            accessibilityHint={label}
            disabled={uploading}
            onPress={() => setChoosing(true)}
          />
          {value && onRemove ? (
            <Button
              size="sm"
              variant="ghost"
              label={t('ui.photo.remove')}
              disabled={uploading}
              onPress={onRemove}
            />
          ) : null}
        </View>
      </View>
      {uploading ? <ProgressBar value={progress} label={t('ui.photo.uploading')} /> : null}
      {error ? (
        <View style={styles.row}>
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
          {onRetry ? (
            <Button size="sm" variant="ghost" label={t('ui.photo.retry')} onPress={onRetry} />
          ) : null}
        </View>
      ) : null}
      {denied ? <Text style={styles.error}>{t('ui.photo.denied')}</Text> : null}
      {help && !error ? <Text style={styles.help}>{help}</Text> : null}
      <Sheet visible={choosing} onClose={() => setChoosing(false)} title={label}>
        <Button block icon="camera" label={t('ui.photo.camera')} onPress={() => choose('camera')} />
        <Button
          block
          variant="secondary"
          icon="image"
          label={t('ui.photo.library')}
          onPress={() => choose('library')}
        />
        <Button
          block
          variant="ghost"
          label={t('ui.sheet.cancel')}
          onPress={() => setChoosing(false)}
        />
      </Sheet>
    </View>
  );
}
