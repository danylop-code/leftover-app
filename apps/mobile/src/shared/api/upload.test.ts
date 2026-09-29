import { ImageResponse } from '@leftover/shared';
import { useSession } from '../store/session';
import { ApiError, apiUpload, NetworkError } from './client';

type Handler = ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null;

/** A stand-in XMLHttpRequest that answers with `reply` after reporting progress. */
class FakeXhr {
  static last: FakeXhr;
  static reply: { status: number; body: string } | 'offline' = { status: 200, body: '' };
  method = '';
  url = '';
  headers: Record<string, string> = {};
  body: unknown;
  status = 0;
  responseText = '';
  upload: { onprogress: Handler } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;
  constructor() {
    FakeXhr.last = this;
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  abort() {
    this.onabort?.();
  }
  send(body: unknown) {
    this.body = body;
    const reply = FakeXhr.reply;
    if (reply === 'offline') return this.onerror?.();
    this.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 });
    this.status = reply.status;
    this.responseText = reply.body;
    this.onload?.();
  }
}

const file = { uri: 'file:///tmp/photo.jpg', name: 'photo.jpg', type: 'image/jpeg' };
const realXhr = globalThis.XMLHttpRequest;

beforeEach(() => {
  globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
  useSession.setState({ status: 'signedIn', token: 'tok', user: null });
});
afterEach(() => {
  globalThis.XMLHttpRequest = realXhr;
});

describe('apiUpload', () => {
  it('PUTs the file as multipart with the token, reports progress and parses the answer', async () => {
    FakeXhr.reply = { status: 200, body: JSON.stringify({ url: '/images/stores/s1/logo/a.jpg' }) };
    const progress: number[] = [];
    const res = await apiUpload('/store/logo', file, {
      schema: ImageResponse,
      onProgress: (p) => progress.push(p),
    });
    expect(res).toEqual({ url: '/images/stores/s1/logo/a.jpg' });
    expect(FakeXhr.last.method).toBe('PUT');
    expect(FakeXhr.last.url).toBe('http://localhost:8787/store/logo');
    expect(FakeXhr.last.headers.Authorization).toBe('Bearer tok');
    expect(FakeXhr.last.body).toBeInstanceOf(FormData);
    expect(progress).toEqual([0.5, 1]);
  });

  it('turns the error envelope into an ApiError', async () => {
    FakeXhr.reply = {
      status: 400,
      body: JSON.stringify({
        error: { code: 'validation', message: 'Bad', fields: { file: ['Use a JPEG'] } },
      }),
    };
    await expect(apiUpload('/store/logo', file, { schema: ImageResponse })).rejects.toEqual(
      expect.objectContaining({ status: 400, code: 'validation' }),
    );
    await expect(apiUpload('/store/logo', file, { schema: ImageResponse })).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it('is a NetworkError when the request never gets an answer', async () => {
    FakeXhr.reply = 'offline';
    await expect(apiUpload('/store/logo', file, { schema: ImageResponse })).rejects.toBeInstanceOf(
      NetworkError,
    );
  });
});
