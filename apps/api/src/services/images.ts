import { IMAGE_MAX_BYTES, type ImageResponse, type ImageType } from '@leftover/shared';
import { eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { bags, stores } from '../db/schema';
import { nowIso } from '../lib/clock';
import { ValidationError } from '../lib/errors';
import { imageUrl, newImageKey } from './image-keys';
import { findMyBag, requireMyStore } from './store-bags';

/** Long-lived: keys are never reused, so a cached image is never stale. */
export const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];
const WEBP_TAG_OFFSET = 8;
const SNIFF_BYTES = 12;

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) =>
  sig.every((b, i) => bytes[offset + i] === b);

/** The image type from the file's first bytes; the name and declared type aren't trusted. */
export const sniffImageType = (head: Uint8Array): ImageType | null => {
  if (startsWith(head, JPEG)) return 'image/jpeg';
  if (startsWith(head, PNG)) return 'image/png';
  if (startsWith(head, RIFF) && startsWith(head, WEBP, WEBP_TAG_OFFSET)) return 'image/webp';
  return null;
};

const invalidImage = (message: string) => new ValidationError({ file: [message] });

/** A checked upload: JPEG, PNG or WebP by content, at most IMAGE_MAX_BYTES. */
export const readImage = async (
  file: unknown,
): Promise<{ bytes: ArrayBuffer; type: ImageType }> => {
  if (!(file instanceof File)) throw invalidImage('Attach the image as the `file` form field.');
  if (file.size > IMAGE_MAX_BYTES) throw invalidImage('Use an image of 5 MB or less.');
  if (file.size === 0) throw invalidImage('The image is empty.');
  const bytes = await file.arrayBuffer();
  const type = sniffImageType(new Uint8Array(bytes.slice(0, SNIFF_BYTES)));
  if (!type) throw invalidImage('Use a JPEG, PNG or WebP image.');
  return { bytes, type };
};

// Room for the multipart boundary and headers around the file.
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

/** Refuses a body that says it's bigger than an image can be, before reading it. */
export const checkUploadLength = (contentLength: string | undefined) => {
  if (Number(contentLength) > IMAGE_MAX_BYTES + MULTIPART_OVERHEAD_BYTES)
    throw invalidImage('Use an image of 5 MB or less.');
};

type Slot = { key: string | null; save: (key: string | null) => Promise<unknown> };

/**
 * Stores the new image under a fresh key, points the row at it, then deletes the old object.
 * `file === null` just deletes. The row is updated before the old object goes, so a failure in
 * between leaves an orphan object, never a broken image.
 */
const replace = async (
  images: R2Bucket,
  slot: Slot,
  newKey: (type: ImageType) => string,
  file: unknown | null,
): Promise<ImageResponse> => {
  let key: string | null = null;
  if (file !== null) {
    const { bytes, type } = await readImage(file);
    key = newKey(type);
    await images.put(key, bytes, {
      httpMetadata: { contentType: type, cacheControl: IMAGE_CACHE_CONTROL },
    });
  }
  await slot.save(key);
  if (slot.key) await images.delete(slot.key);
  return { url: imageUrl(key) };
};

export const setStoreImage = async (
  db: Db,
  images: R2Bucket,
  ownerId: string,
  which: 'logo' | 'cover',
  file: unknown | null,
): Promise<ImageResponse> => {
  const store = await requireMyStore(db, ownerId);
  const column = which === 'logo' ? 'logoKey' : 'coverKey';
  return replace(
    images,
    {
      key: store[column],
      save: (key) =>
        db
          .update(stores)
          .set({ [column]: key })
          .where(eq(stores.id, store.id)),
    },
    (type) => newImageKey(which, store.id, type),
    file,
  );
};

export const setBagPhoto = async (
  db: Db,
  images: R2Bucket,
  ownerId: string,
  bagId: string,
  file: unknown | null,
): Promise<ImageResponse> => {
  const store = await requireMyStore(db, ownerId);
  const bag = await findMyBag(db, store.id, bagId);
  return replace(
    images,
    {
      key: bag.photoKey,
      save: (key) =>
        db.update(bags).set({ photoKey: key, updatedAt: nowIso() }).where(eq(bags.id, bag.id)),
    },
    (type) => newImageKey('photo', bag.id, type),
    file,
  );
};
