import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import type { UploadFile } from '../api/client';
import { IMAGE_JPEG_QUALITY, IMAGE_MAX_EDGE_PX } from '../constants/images';

export type ImageSource = 'camera' | 'library';

export type PickResult =
  | { status: 'picked'; file: UploadFile }
  | { status: 'cancelled' }
  | { status: 'denied' };

/** Resizes to at most IMAGE_MAX_EDGE_PX on the long edge and re-encodes as JPEG. */
const shrink = async (uri: string, width: number, height: number): Promise<UploadFile> => {
  const context = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > IMAGE_MAX_EDGE_PX) {
    context.resize(width >= height ? { width: IMAGE_MAX_EDGE_PX } : { height: IMAGE_MAX_EDGE_PX });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: IMAGE_JPEG_QUALITY, format: SaveFormat.JPEG });
  return { uri: saved.uri, name: 'photo.jpg', type: 'image/jpeg' };
};

/** Lets the person take or choose a photo, ready to upload (small JPEG). */
export const pickImage = async (source: ImageSource): Promise<PickResult> => {
  const permission =
    source === 'camera'
      ? await requestCameraPermissionsAsync()
      : await requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };
  const launch = source === 'camera' ? launchCameraAsync : launchImageLibraryAsync;
  const result = await launch({ mediaTypes: ['images'], quality: 1 });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return { status: 'cancelled' };
  return { status: 'picked', file: await shrink(asset.uri, asset.width, asset.height) };
};
