// The only module allowed to call fetch (rules/state-and-data.md).
import { ApiError as ApiErrorBody } from '@leftover/shared';
import { Platform } from 'react-native';
import { z } from 'zod';
import { DEFAULT_API_URL } from '../constants/api';
import { useSession } from '../store/session';

/** The server answered with a non-2xx status. `code` comes from the shared error envelope. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string[]>,
    /** Extra envelope keys, e.g. `qtyAvailable` on `sold_out`. */
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** The request never got a response (offline, DNS, timeout). */
export class NetworkError extends Error {
  constructor(readonly cause?: unknown) {
    super('Network request failed');
    this.name = 'NetworkError';
  }
}

/** The response didn't match the expected schema; its data is never returned. */
export class ParseError extends Error {
  constructor(
    readonly path: string,
    message: string,
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/** Schema for endpoints that answer 204 No Content. */
export const NoContent = z.undefined();

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Options<S extends z.ZodType> = {
  schema: S;
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

const baseUrl = () => process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const buildUrl = (path: string, query?: Options<z.ZodType>['query']) => {
  const params = Object.entries(query ?? {})
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${baseUrl()}${path}${params ? `?${params}` : ''}`;
};

const readJson = async (res: Response): Promise<{ ok: true; value: unknown } | { ok: false }> => {
  const text = await res.text();
  if (!text) return { ok: true, value: undefined };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
};

/** Status, error envelope and schema checks shared by `apiRequest` and `apiUpload`. */
async function parseResponse<S extends z.ZodType>(
  path: string,
  res: Response,
  schema: S,
  token: string | null,
): Promise<z.output<S>> {
  const payload = await readJson(res);

  if (!res.ok) {
    // An authenticated call rejected: the token expired or was revoked (a failed login sends none).
    if (res.status === 401 && token) await useSession.getState().signOut();
    const envelope = payload.ok ? ApiErrorBody.safeParse(payload.value) : undefined;
    if (envelope?.success) {
      const { code, message, fields } = envelope.data.error;
      // Keep envelope keys the schema doesn't name (e.g. `qtyAvailable`) as details.
      const raw = (payload as { value: { error: Record<string, unknown> } }).value.error;
      const { code: _code, message: _message, fields: _fields, ...details } = raw;
      throw new ApiError(res.status, code, message, fields, details);
    }
    throw new ApiError(res.status, 'unknown', res.statusText || `HTTP ${res.status}`);
  }

  if (!payload.ok) throw new ParseError(path, 'Response body is not JSON');
  const parsed = schema.safeParse(payload.value);
  if (!parsed.success) throw new ParseError(path, z.prettifyError(parsed.error));
  return parsed.data;
}

/** Performs a request and returns the body parsed by `schema`, or throws ApiError/NetworkError/ParseError. */
export async function apiRequest<S extends z.ZodType>(
  path: string,
  options: Options<S>,
): Promise<z.output<S>> {
  const { schema, method = 'GET', body, query, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = useSession.getState().token;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new NetworkError(cause);
  }

  return parseResponse(path, res, schema, token);
}

/** An image path from the API (`/images/…`) as a URL the app can load. */
export const imageUri = (path: string | null | undefined): string | null =>
  path ? `${baseUrl()}${path}` : null;

/** A local file to upload: what the image picker returns (after resizing). */
export type UploadFile = { uri: string; name: string; type: string };

type UploadOptions<S extends z.ZodType> = {
  schema: S;
  /** 0–1 as the body is sent. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
};

// On web the picker gives a blob:/data: URL, which FormData can't take as `{ uri }`.
const formFile = async (file: UploadFile): Promise<Blob | UploadFile> =>
  Platform.OS === 'web' ? (await fetch(file.uri)).blob() : file;

/**
 * `PUT` a file as the multipart `file` field, reporting upload progress (fetch can't, so this
 * uses XMLHttpRequest). Errors match `apiRequest`: ApiError, NetworkError or ParseError.
 */
export async function apiUpload<S extends z.ZodType>(
  path: string,
  file: UploadFile,
  { schema, onProgress, signal }: UploadOptions<S>,
): Promise<z.output<S>> {
  const form = new FormData();
  const part = await formFile(file);
  if (part instanceof Blob) form.append('file', part, file.name);
  // React Native's FormData takes `{ uri, name, type }` for a file on disk.
  else form.append('file', part as unknown as Blob);
  const token = useSession.getState().token;

  const { status, text } = await new Promise<{ status: number; text: string }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', buildUrl(path));
      xhr.setRequestHeader('Accept', 'application/json');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) onProgress?.(e.loaded / e.total);
      };
      xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
      xhr.onerror = () => reject(new NetworkError());
      xhr.ontimeout = () => reject(new NetworkError());
      signal?.addEventListener('abort', () => xhr.abort());
      xhr.onabort = () => reject(new NetworkError('aborted'));
      xhr.send(form);
    },
  );
  onProgress?.(1);
  return parseResponse(path, new Response(text || null, { status }), schema, token);
}
