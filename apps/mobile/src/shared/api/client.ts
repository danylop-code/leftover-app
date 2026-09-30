// The only module allowed to call fetch (rules/state-and-data.md).
import { ApiError as ApiErrorBody } from '@leftover/shared';
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
