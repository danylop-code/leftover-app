import { ImageResponse } from '@leftover/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest, apiUpload, type UploadFile } from './client';
import { keys } from './keys';

/** Which image (brief 20): the shop's logo or cover, or one bag's photo. */
export type ImageTarget =
  | { kind: 'logo' }
  | { kind: 'cover' }
  | { kind: 'bagPhoto'; bagId: string };

const pathOf = (target: ImageTarget) =>
  target.kind === 'bagPhoto' ? `/store/bags/${target.bagId}/photo` : `/store/${target.kind}`;

/**
 * Uploads (or, with `file: null`, removes) an image and refreshes everything that shows it.
 * `progress` is 0–1 while an upload runs, null otherwise.
 */
export const useImageUpload = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const mutation = useMutation({
    mutationFn: async ({ target, file }: { target: ImageTarget; file: UploadFile | null }) => {
      if (!file) return apiRequest(pathOf(target), { method: 'DELETE', schema: ImageResponse });
      setProgress(0);
      return apiUpload(pathOf(target), file, { schema: ImageResponse, onProgress: setProgress });
    },
    onSettled: () => setProgress(null),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.shopBags() }),
        queryClient.invalidateQueries({ queryKey: keys.myStore() }),
        queryClient.invalidateQueries({ queryKey: keys.nearbyAll() }),
        queryClient.invalidateQueries({ queryKey: keys.storeDetailAll() }),
      ]),
  });
  return { ...mutation, progress };
};
