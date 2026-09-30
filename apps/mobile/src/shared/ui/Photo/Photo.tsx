import { Image } from 'expo-image';
import { useState } from 'react';
import { imageUri } from '../../api/client';
import { FADE_MS, useStyles } from './styles';

type Props = {
  /** An API image path (`/images/…`) or a local file URI (a picked photo before upload). */
  src: string | null | undefined;
};

/**
 * A photo laid over its placeholder (brief 20): the parent draws the category tint or the
 * initial, this covers it once loaded. Missing or failing images leave the placeholder showing.
 * Decorative: the surrounding card or row carries the accessible label.
 */
export function Photo({ src }: Props) {
  const { styles } = useStyles();
  // Remembers which image failed, so a new one gets its own chance.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return null;
  const uri = src.startsWith('/images/') ? imageUri(src) : src;
  if (!uri) return null;
  return (
    <Image
      source={{ uri }}
      style={styles.fill}
      contentFit="cover"
      transition={FADE_MS}
      onError={() => setFailedSrc(src)}
      accessible={false}
      testID="photo"
    />
  );
}
