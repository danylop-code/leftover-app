import { ApiError, NetworkError, ParseError } from './client';
import { shouldRetry } from './query-client';

describe('shouldRetry', () => {
  it('never retries 4xx', () => {
    expect(shouldRetry(0, new ApiError(404, 'not_found', 'Not found'))).toBe(false);
    expect(shouldRetry(0, new ApiError(409, 'sold_out', 'Sold out'))).toBe(false);
  });

  it('never retries a response that failed to parse', () => {
    expect(shouldRetry(0, new ParseError('/x', 'bad'))).toBe(false);
  });

  it('retries network and 5xx failures a limited number of times', () => {
    expect(shouldRetry(0, new NetworkError())).toBe(true);
    expect(shouldRetry(0, new ApiError(503, 'unknown', 'Unavailable'))).toBe(true);
    expect(shouldRetry(2, new NetworkError())).toBe(false);
  });
});
