import type { ImageType, ImageUrl } from '@leftover/shared';
import { newId } from '../lib/ids';

// R2 object keys and the `/images/<key>` paths the API serves them at (brief 20). Keys are
// never reused: a replaced image gets a new key, so served images can be cached forever.

const EXTENSION: Record<ImageType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type ImageSlot = 'logo' | 'cover' | 'photo';

/** `stores/<id>/logo/<uuid>.jpg`, `bags/<id>/photo/<uuid>.webp`. */
export const newImageKey = (slot: ImageSlot, ownerId: string, type: ImageType): string =>
  `${slot === 'photo' ? 'bags' : 'stores'}/${ownerId}/${slot}/${newId()}.${EXTENSION[type]}`;

export const imageUrl = (key: string | null): ImageUrl | null => (key ? `/images/${key}` : null);

/** Only keys we generate can be served (no `..`, no odd characters). */
export const IMAGE_KEY = /^(stores|bags)\/[\w-]+\/(logo|cover|photo)\/[\w-]+\.(jpg|png|webp)$/;
