import { z } from 'zod';

// Shop and bag photos (brief 20), stored in R2 and served by the API at `/images/<key>`.

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

/**
 * An image as the API sends it: a path on the API (`/images/stores/s1/logo/abc.jpg`). The app
 * resolves it against its API base URL, so the same data works locally and deployed.
 */
export const ImageUrl = z.string().regex(/^\/images\/[\w\-./]+$/, 'Not an image path');
export type ImageUrl = z.infer<typeof ImageUrl>;

/** `PUT`/`DELETE` of a logo, cover or bag photo: where it now lives (null once deleted). */
export const ImageResponse = z.object({ url: ImageUrl.nullable() });
export type ImageResponse = z.infer<typeof ImageResponse>;
